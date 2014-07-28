// ====================================================
// ||           CONSTANTS & CONFIGURATION            ||
// ====================================================

// The number of voices Maestro will track
8 => int NUM_VOICES;

// The number of commands Maestro will track
8 => int NUM_COMMANDS;

// The number of drum sounds Maestro will track
7 => int NUM_DRUMS;

// Default tempo in beats per minute (BPM)
120 => int DEFAULT_TEMPO;

// Fractional beat resolution / division
// i.e. 8 means notes can be specified to align
// to 1/8th fractions of a beat, but not between
// those fractions.
8 => int BEAT_RESOLUTION_DIVIDER;
1.0/BEAT_RESOLUTION_DIVIDER => float BEAT_RESOLUTION_FRACTION;

// Master loop length in beats
2048 => int MASTER_LOOP_LENGTH_IN_BEATS;

// OSC listener port
// The port at which to listen for OSC messages from
// BlockyTalky.
1111 => int OSC_LISTENER_PORT;

// OSC sound module hostname
// The hostname at which to send OSC messages
// containing individual note data (for playing them).
"localhost" => string OSC_SOUND_MODULE_HOSTNAME;

// OSC sound module port
// The port at which to send OSC messages with note
// data (for playing notes)
1112 => int OSC_SOUND_MODULE_PORT;

// Debug printing
// Printing probably slows down the virtual machine,
// so it's recommend to keep this off unless
// you're actively debugging this module.
1 => int DEBUG_PRINTING;

// ====================================================
// ||        INTERNAL PROTOCOL SPECIFICATION         ||
// ====================================================

// NOTES:
// Notes are arrays of length 2: [int pitch, int duration]
//
// NOTE PITCH:
// Pitch values > 0 are interpreted as notes normally.
// Pitches <= 0, by contrast, are interpreted as special
// commands:
// 0: Rest, or an "empty note" if the note's duration is 0.
// -1: Rest, or an "empty note" if the note's duration is 0.
// -2: Specifies a set volume command, encoded in duration. (0-100)
// -3: Specifies a set bandpassfilter command, encoded in duration. (0-100)
// -4 - -9: Unspecified property setting commands.
// -10 - -16: Drum notes
// -17+: Unspecified.
//
// NOTE DURATION
// Duration values are specified internally in fractions of a beat,
// specifically, whole number multiples of the
// BEAT_RESOLUTION_FRACTION.

// SETTING PROPERTIES
// pitches from -2 to -9 specify properties to set.
// The duration value of the note then determines
// both the VOICE and the VALUE of the property
// message. See below:
// duration = 0-100  = voice 1 property
//         1000-1100 = voice 2 property
//         2000-2100 = voice 3 property
//         3000-3100 = voice 4 property
//         4000-4100 = voice 5 property
//         5000-5100 = voice 6 property
//         6000-6100 = voice 7 property
//         7000-7100 = voice 8 property
// Duration values outside of the specified ranges
// will round down to 100 for the corresponding voice
// or will be ignored for negative durations.
// TODO: Implement and test the above

// ====================================================
// ||               OSC INITIALIZATION               ||
// ====================================================

// Receiving messages from BlockyTalky
OscRecv OSC_receiver;
OSC_LISTENER_PORT => OSC_receiver.port;
OSC_receiver.listen();

// Sending messages to Pure Data, the sound module
OscSend OSC_sender;
OSC_sender.setHost(OSC_SOUND_MODULE_HOSTNAME, OSC_SOUND_MODULE_PORT);

// Initializing OSC event listeners
OSC_receiver.event(
        "/lpc/maestro/voice/play, ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "iif")
                   @=> OscEvent voice_play_event;
OSC_receiver.event("/lpc/maestro/voice/stop, if")
                   @=> OscEvent voice_stop_event;
OSC_receiver.event(
        "/lpc/maestro/drums/play, iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
                               + "if")
                   @=> OscEvent drums_play_event;
OSC_receiver.event("/lpc/maestro/drums/stop, if")
                   @=> OscEvent drums_stop_event;
OSC_receiver.event("/lpc/maestro/tempo, f")
                   @=> OscEvent tempo_event;
OSC_receiver.event("/lpc/maestro/voice/volume, iif")
                   @=> OscEvent voice_volume_event;
OSC_receiver.event("/lpc/maestro/voice/instrument, iif")
                   @=> OscEvent voice_instrument_event;
OSC_receiver.event("/lpc/maestro/voice/bandpassfilter, iif")
                   @=> OscEvent voice_bandpassfilter_event;
OSC_receiver.event("/lpc/maestro/drums/volume, iiiiiii")
                   @=> OscEvent drums_volume_event;
                   
// Spork event-listening shreds
spork ~ play_voice_message_handler_shred();
spork ~ stop_voice_message_handler_shred();

// ====================================================
// ||                MAESTRO LOGIC                   ||==--
// ====================================================

// Assign current tempo in BPM
DEFAULT_TEMPO => float tempo;

// Initialize master loop index
0 => int master_loop_index;

// Initialize master loop
// Memory needed for master loop:
// Notes are two ints (32 bits each), so 64 bits
// Formula for max memory is
// size of a note in bits
//     * master loop length in beats
//     * beat resolution divider
//     * (number of voices + number of commands + number of drums)
//     / 8192 (bits / kilobyte)
// = RAM needed in kilobytes
// With the default sizes of
// beat divider of 8 commands and 8 voices and 7 drums,
// each beat of storage in the master loop requires
// ~1.5 KB of RAM.
int master_loop
        [NUM_VOICES + NUM_COMMANDS + NUM_DRUMS]
        [MASTER_LOOP_LENGTH_IN_BEATS * BEAT_RESOLUTION_DIVIDER]
        [2];
        
if (DEBUG_PRINTING)
    <<< "Master loop initialized." >>>;
        
// Tracking notes added so they can be
// easily removed on a stop command
int notes_added[NUM_VOICES][master_loop_length()];
int notes_added_start_index[NUM_VOICES];

// Tracking whether or not a voice should
// stop looping
int voice_should_exit[NUM_VOICES];

// wait a second before starting
1::second => now;

spork ~ maestro_shred();   

function void maestro_shred() {
    
    // Populate the master loop with
    // debug music data
    // TODO: NYI
    
    while (true) {
        
        // These are the buffers for notes
        // that may be played at any given
        // beat-fractional timeslot.
        // (NUM_VOICES voices, commands for each voice, 7 drum sounds)
        int note_package[NUM_VOICES][2];
        int cmd_package[NUM_COMMANDS][2];
        int drum_package[NUM_DRUMS][2];
        // Whether or not to process packages in the given timeslot
        int should_process_packages;
        
        // Prepare note / command / drum packages for 
        // this timeslot across all 8 voices
        0 => should_process_packages;
        for (0 => int i; i < master_loop_num_tracks(); i++) {
            
            master_loop[i][master_loop_index] @=> int noteslot[];
            
            if (!is_empty(noteslot)) {
                if (noteslot[0] > 0) {  // melodic note
                    noteslot[0] => note_package[i][0];
                    noteslot[1] => note_package[i][1];
                    1 => should_process_packages;
                    
                    // Consume the note.
                    0 => master_loop[i][master_loop_index][0];
                    0 => master_loop[i][master_loop_index][1];
                    // Do note tracking logistics.
                    // When we consume a note, we should
                    // increment the notes_added starting
                    // index so we don't waste time trying
                    // to zero that note out on a "stop"
                    // command because we've already played
                    // it and zeroed it out.
                    1 +=> notes_added_start_index[i];
                    master_loop_length()
                                 %=> notes_added_start_index[i];
                }
                else if (noteslot[0] == -1) {  // rest note
                    // I think rests are safe to
                    // ignore currently, but in the future
                    // they may require actual commands
                    // sent to the Pd patch.
                }
                else if (noteslot[0] == -2) {  // set-volume note
                    noteslot[0] => cmd_package[i-8][0];
                    noteslot[1] => cmd_package[i-8][1];
                    1 => should_process_packages;
                    
                    // Consume the command
                    0 => master_loop[i][master_loop_index][0];
                    0 => master_loop[i][master_loop_index][1];
                }
                else if (noteslot[0] == -3) {  // set-bandpassfilter note
                    noteslot[0] => cmd_package[i-8][0];
                    noteslot[1] => cmd_package[i-8][1];
                    1 => should_process_packages;
                    
                    // Consume the command
                    0 => master_loop[i][master_loop_index][0];
                    0 => master_loop[i][master_loop_index][1];
                }
                else if (noteslot[0] <= -10
                         && noteslot[0] >= -16) {  // drum note
                    1 => drum_package
                             [drumnote_from_pitch(noteslot[0])]
                             [0];
                    1 => should_process_packages;
                }
            }
        }
        
        // Spork a shred to handle package processing
        // if some packages are not empty
        if (should_process_packages) {
            spork ~ process_packages_shred(note_package,
                                           cmd_package,
                                           drum_package);
        }
        
        if (DEBUG_PRINTING) {
            // DEBUG print master loop index
            if (true) {
                <<< master_loop_index >>>;
            }
            // DEBUG print beat number
            if ((master_loop_index+1)
                        % BEAT_RESOLUTION_DIVIDER == 0) {
                <<< "Beat. "
                        + (master_loop_index+1)
                        / BEAT_RESOLUTION_DIVIDER >>>;
                <<< "Voice 1 exit: "
                        + voice_should_exit[0] >>>;
            }
        }
        
        // TODO: Optimization: store seconds_per_beat once,
        // only change it when tempo is changed
        seconds_per_beat() * BEAT_RESOLUTION_FRACTION
            => now;
        
        // Increment master loop index
        1 +=> master_loop_index;
        master_loop_length() %=> master_loop_index;
    }
}

// ====================================================
// ||                PACKAGE PROCESSING              ||
// ====================================================

// process_packages_shred
// This function is used as its own shred to process
// note, command, and drum packages and send OSC
// messages based on their contents.
function void process_packages_shred(int note_package[][],
                                     int cmd_package[][],
                                     int drum_package[][]) {
    // Process note package.
    for (0 => int i; i < NUM_VOICES; i++) {
        // Only process a note in the package if
        // the note is not empty (duration != 0)
        if (note_package[i][1] != 0) {
            "/lpc/sound/voice" + (i+1) + "/play" =>
                                        string address;
            note_package[i][0] => int pitch;
            beat_fractions_to_seconds(note_package[i][1]) =>
                                        float duration;
            
            OSC_sender.startMsg(address + ", i, f");
            OSC_sender.addInt(pitch);
            OSC_sender.addFloat(duration);
            
            if (DEBUG_PRINTING) {
                // DEBUG print message sent
                <<< "Note sent with pitch " + pitch
                                            + " and duration "
                                            + duration >>>;
            }
        }
    }
    
    // Process command package.
    for (0 => int i; i < NUM_COMMANDS; i++) {
        // Only process a note in the package if
        // the note is not empty. ('pitch' != 0)
        if (cmd_package[i][0] != 0) {
            "" => string address;
            0 => int address_was_set;
            // volume command.
            if (cmd_package[i][0] == -2) {
                "/lpc/sound/voice" + (i+1) + "/volume" =>
                                            string address;
                cmd_package[i][1] => int value;
                
                OSC_sender.startMsg(address + ", i");
                OSC_sender.addInt(value);
                
                if (DEBUG_PRINTING) {
                    // DEBUG print message sent
                    <<< "Volume sent for voice " + i
                                                 + " with value "
                                                 + value >>>;
                }
            }
            // bandpassfilter command.
            if (cmd_package[i][0] == -3) {
                "/lpc/sound/voice" + (i+1) + "/bandpassfilter" =>
                                            string address;
                cmd_package[i][1] => int value;
                
                OSC_sender.startMsg(address + ", i");
                OSC_sender.addInt(value);
                
                if (DEBUG_PRINTING) {
                    // DEBUG print message sent
                    <<< "bandpassfilter sent for voice " + i
                                                 + " with value "
                                                 + value >>>;
                }
            }
            // TODO: Add more commands.
        }
    }
    
    // Process drum package.
    // For drums, convert the whole package
    // into one OSC message, then send it to the
    // Pd patch.
    0 => int drum_package_contains_something;
    for (0 => int i; i < NUM_DRUMS; i++) {
        if (drum_package[i][0] == 1) {
            1 => drum_package_contains_something;
        }
    }
    if (drum_package_contains_something) {
        "/lpc/sound/drums/play, i, i, i, i, i, i, i"
                                        => string address;
        OSC_sender.startMsg(address);
        for (0 => int i; i < NUM_DRUMS; i++) {
            OSC_sender.addInt(drum_package[i][0]);
        }
        
        if (DEBUG_PRINTING) {
            // DEBUG print message sent
            <<< "drum message sent: " + drum_package[0][0] + ", "
                                      + drum_package[1][0] + ", "
                                      + drum_package[2][0] + ", "
                                      + drum_package[3][0] + ", "
                                      + drum_package[4][0] + ", "
                                      + drum_package[5][0] + ", "
                                      + drum_package[6][0] >>>;
        }
        
    }
}

// ====================================================
// ||          BT MESSAGE HANDLER FUNCTIONS          ||
// ====================================================

function void play_voice_message_handler_shred() {
    while (true) {
        // Receive messages.
        voice_play_event => now;
        
        // DEBUG Print message receipt.
        if (DEBUG_PRINTING) {
            <<< "Received voice_play_event." >>>;
        }
        
        // Initialize message data buffers.
        int message_phrase_data[128][2];
        int message_voice_index;
        int message_should_loop_flag;
        int message_should_overlay_flag;
        float message_beat_delay;
        float message_beat_alignment;
        
        // Process each message.
        while (voice_play_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            for (0 => int i; i < 128; i++) {
                voice_play_event.getInt()
                                 => message_phrase_data[i][0];
                parse_duration(voice_play_event.getFloat())
                                 => message_phrase_data[i][1];
            }
            voice_play_event.getInt() - 1
                                 => message_voice_index;
            voice_play_event.getInt()
                                 => message_should_loop_flag;
            voice_play_event.getFloat()
                                 => message_beat_alignment;
            
            // Spawn thread dedicated to updating
            // the master loop using this message
            // data.
            spork ~ play_voice_message_processor(
                    message_phrase_data, message_voice_index,
                    message_should_loop_flag,
                    message_beat_alignment);
        }
    }
}

function void stop_voice_message_handler_shred() {
    while (true) {
        // Receive message(s).
        voice_stop_event => now;
        
        // DEBUG Print message receipt.
        if (DEBUG_PRINTING) {
            <<< "Received voice_stop_event." >>>;
        }
        
        // Initialize message data buffers.
        int message_voice_index;
        float message_beat_alignment;
        
        // Process each message in the queue.
        while (voice_stop_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            voice_stop_event.getInt() - 1
                                 => message_voice_index;
            voice_stop_event.getFloat()
                                 => message_beat_alignment;
            
            // Actually process the event.
            stop_voice_message_processor(
                    message_voice_index, message_beat_alignment);
        }
    }
}

function void play_drums_message_handler_shred() {
    while (true) {
        // Receive messages.
        drums_play_event => now;
        
        // DEBUG Print message receipt.
        if (DEBUG_PRINTING) {
            <<< "Received drums_play_event." >>>;
        }
        
        // Initialize message data buffers.
        int message_phrase_data[112][2];
        int message_voice_index;
        int message_should_loop_flag;
        int message_should_overlay_flag;
        float message_beat_delay;
        float message_beat_alignment;
        
        // Process each message.
        while (voice_play_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            for (0 => int i; i < 112; i++) {
                voice_play_event.getInt()
                                 => message_phrase_data[i][0];
                parse_duration(voice_play_event.getFloat())
                                 => message_phrase_data[i][1];
            }
            voice_play_event.getInt() - 1
                                 => message_voice_index;
            voice_play_event.getInt()
                                 => message_should_loop_flag;
            voice_play_event.getFloat()
                                 => message_beat_alignment;
            
            // Spawn thread dedicated to updating
            // the master loop using this message
            // data.
            spork ~ play_voice_message_processor(
                    message_phrase_data, message_voice_index,
                    message_should_loop_flag,
                    message_beat_alignment);
        }
    }
}

function void stop_drums_message_handler_shred() {
    
}

function void set_tempo_message_handler_shred() {
    
}

function void set_voice_volume_message_handler_shred() {
    // TODO: Implement
}

function void set_voice_instrument_message_handler_shred() {
    // TODO: Implement
}

function void set_drums_volume_message_handler_shred() {
    // TODO: Implement
}

function void set_voice_bandpassfilter_message_handler_shred() {
    // TODO: Implement
}

// ====================================================
// ||         BT MESSAGE PROCESSOR FUNCTIONS         ||
// ====================================================

function void play_voice_message_processor(
        int phrase_data[][], int voice,
        int should_loop_flag, float beat_alignment) {
            
    // Get starting index of note placement based
    // on beat alignment.
    beat_align(master_loop_index + 1, beat_alignment)
                         => int index;
            
    if (DEBUG_PRINTING) {
        <<< "Processing play. First waiting for beat align." >>>;
        <<< "I'll wait until "
                + index >>>;
    }
    
    // First, wait for beat alignment
    beat_fractions_to_seconds(
            current_beat_align_offset(beat_alignment))
            ::second
                     => now;
    
    if (DEBUG_PRINTING) {
        <<< "Done waiting for alignment to play." >>>;
    }
    
    // Prepare to iterate across phrase data.
    0 => notes_added_start_index[voice];
    0 => int notes_added_index;
    0 => int duration_processed;
    0 => int total_duration_processed;
    0 => int pitch;
    0 => int duration;
    0 => int should_stop;
    for (0 => int i; i < 128; i++) {
        // Check should_stop status first
        if (should_stop) {
            break;
        }
        // Get note data.
        phrase_data[i][0] => pitch;
        phrase_data[i][1] => duration;
        if (duration != 0) {
            // Add note to master loop.
            add_voice_note_to_master_loop(
                    index, pitch, duration, voice);
            duration => duration_processed;
            // Keep track of duration processed thus far
            duration_processed +=> total_duration_processed;
            // Keep track of notes added to this voice
            index => notes_added[voice][notes_added_index];
            
            // Perform index incrementing logistics
            duration_processed +=> index;
            master_loop_length() %=> index;
            1 +=> notes_added_index;
            master_loop_length() %=> notes_added_index;
        }
        // Break if we should exit
        if (voice_should_exit[voice]) {
            
            if (DEBUG_PRINTING) {
                <<< "1Voice " + voice + " exit processing."
                        + " It's " + voice_should_exit[voice] >>>;
            }
            
            0 => voice_should_exit[voice];
            
            if (DEBUG_PRINTING) {
                <<< "Set voice should exit, now "
                        + (voice_should_exit[voice]
                        == true) >>>;
            }
            break;
        }
        if (should_loop_flag && i == 127) {
            
            if (DEBUG_PRINTING) {
                <<< "About to wait before looping again" >>>;
            }
            
            // Wait total_duration_processed
            // before looping back again
            // but in beat fraction increments
            // fraction, checking to make sure
            // we shouldn't exit (via stop
            // messages)
            for (0 => int i; i < total_duration_processed;
                    1 +=> i) {
                        
                beat_fractions_to_seconds(1)::second => now;
                        
                // Check should_exit before looping
                if (voice_should_exit[voice]) {
                    
                    if (DEBUG_PRINTING) {
                        <<< "2Voice " + voice + " exit processing." >>>;
                    }
                    
                    0 => voice_should_exit[voice];
                    
                    if (DEBUG_PRINTING) {
                        <<< "Set voice should exit, now "
                                + (voice_should_exit[voice]
                                == true) >>>;
                    }
                    
                    1 => should_stop;
                    break;
                }
            }
            
            if (DEBUG_PRINTING) {
                <<< "Waited " + total_duration_processed
                        + " before looping" >>>;
            }
            
            if (should_stop) {
                break;
            }
            
            // Finally, reset the index
            0 => total_duration_processed;
            -1 => i;
        }
    }
}

function void stop_voice_message_processor(
        int voice, float beat_alignment) {
    
    if (DEBUG_PRINTING) {
        <<< "Processing stop for voice " + 1
        + ". First waiting for beat align." >>>;
        <<< "I'll wait "
                + current_beat_align_offset(beat_alignment)
                + " beat fractions." >>>;
    }
            
    // First, wait for beat alignment
    beat_fractions_to_seconds(
            current_beat_align_offset(beat_alignment))
            ::second
                     => now;
    
    if (DEBUG_PRINTING) {
        <<< "Stop message done waiting." >>>;
    }
    
    // Set that the voice should exit
    // (Voices always check this before adding
    // new notes)
    1 => voice_should_exit[voice];
    
    if (DEBUG_PRINTING) {
        <<< "Set voice_should_exit." >>>;
        
        <<< "Notes added that I'll be trying to get rid of: " >>>;
        <<< notes_added[voice][0] + ", "
                + notes_added[voice][1] + ", "
                + notes_added[voice][2] + ", "
                + notes_added[voice][3] + ", "
                + notes_added[voice][4] + ", "
                + notes_added[voice][5] + ", "
                + notes_added[voice][6] + ", "
                + notes_added[voice][7] >>>;
    }
            
    // Iterate through the added notes for this
    // voice until one of the indices refers
    // to an empty note (indicating that we're
    // finished)
    int i;
    for (0 => int c; c < master_loop_length(); c++) {
        // Find out actual index
        c + notes_added_start_index[voice] => i;
        master_loop_length() %=> i;
        // If we find an "added note" that is already
        // consumed (empty), we're done
        if (master_loop[voice][notes_added[voice][i]][1] == 0) {
            break;
        }
        // Otherwise get rid of the note
        0 => master_loop[voice][notes_added[voice][i]][0];
        0 => master_loop[voice][notes_added[voice][i]][1];
    }
    
    // Before we quit, wait one more beat fraction and
    // then reset the should_exit status just in case
    // all voices were already stopped
    // Otherwise the next started voice would immediately
    // consume the should_exit flag for that voice
    beat_fractions_to_seconds(1)::second => now;
    0 => voice_should_exit[voice];
}

// ====================================================
// ||                HELPER FUNCTIONS                ||
// ====================================================

// seconds_per_beat()
// Returns the number of seconds per beat based on the
// current tempo.
function dur seconds_per_beat() {
    return (1.0 / (tempo / 60.0))::second;
}

// seconds_per_beat_as_float()
// As above, but returns a float rather than a
// time duration type.
function float seconds_per_beat_as_float() {
    return (1.0 / (tempo / 60.0));
}

// master_loop_length()
// Returns the number of slots in the master_loop
// array's second dimension (the time dimension).
function int master_loop_length() {
    return MASTER_LOOP_LENGTH_IN_BEATS * BEAT_RESOLUTION_DIVIDER;
}

// master_loop_num_tracks()
// Returns the number of tracks in the master loop
function int master_loop_num_tracks() {
    return NUM_VOICES + NUM_COMMANDS + NUM_DRUMS;
}

// is_empty(int note[])
// Returns whether or not the argument note,
// an integer list of size 2, is empty.
function int is_empty(int note[]) {
    return note[0] == -1 && note[1] == 0;
}

// drumnote_from_pitch(int pitch)
// Returns 0 - 6 corresponding to -10 through -16
function int drumnote_from_pitch(int pitch) {
    return -pitch - 10;
}

// beat_fraction_to_seconds(int duration)
// Converts internally-represented duration in beat
// fractions (BEAT_RESOLUTION_FRACTION) to a float
// representing duration in seconds.
// Relies on seconds_per_beat_as_float().
function float beat_fractions_to_seconds(int duration) {
    return duration * BEAT_RESOLUTION_FRACTION
                    * seconds_per_beat_as_float();
}

// add_voice_note_to_master_loop(
//         int pitch, float duration_in_beats,
//         int voice, float beat_delay, float beat_alignment)
// Adds a note to the master loop (for melodic notes).
// Returns an int representing how much time this operation
// has been "processed" for this voice past the current
// master loop timeslot index. This could just be the
// duration of the note, but will be larger if there
// is nonzero beat_delay or beat_alignment.
function void add_voice_note_to_master_loop(
        int index, int pitch, int duration, int voice) {
            
    pitch => master_loop[voice][index][0];
    duration => master_loop[voice][index][1];
    
    if (DEBUG_PRINTING) {
        <<< "I was told to add a note to the master loop:" >>>;
        <<< "index: " + index + ", pitch: " + pitch
                + ", duration: " + duration + ", voice: " + voice >>>;
    }
}

// parse_duration(float duration_in_beats)
// Converts an input float representing duration
// in beats to the closest corresponding number
// of atomic fractional beats for use in master
// loop assignment.
function int parse_duration(float duration_in_beats) {
    return ((duration_in_beats * BEAT_RESOLUTION_DIVIDER) $ int);
}

// beat_align
// Given a starting index, returns the index of the
// master loop timeslot aligned to the argument
// beat fraction, provided as a float (fraction of a beat).
// Always aligns forward in time.
function int beat_align(int start_index, float beat_alignment) {
    0 => int offset;
    if (beat_alignment > 0.0) {
        (beat_alignment*BEAT_RESOLUTION_DIVIDER) $ int
                             => int bf_alignment;
        bf_alignment - (start_index % bf_alignment)
                             => offset;
    }
    return (start_index + offset) % master_loop_length();
}

// current_beat_align_offset
// Returns the offset to the current master loop index
// needed to align to the argument beat align.
function int current_beat_align_offset(float beat_alignment) {
    0 => int offset;
    if (beat_alignment > 0.0) {
        (beat_alignment*BEAT_RESOLUTION_DIVIDER) $ int
                             => int bf_alignment;
        bf_alignment - ((master_loop_index+1) % bf_alignment)
                             => offset;
    }
    return offset;
}

// ====================================================
// ||                END OF PROGRAM                  ||
// ====================================================

// Loop forever to keep child threads alive.
while (true) {
    // Allow time to pass.
    2::second => now;
}

<<< "Maestro 2.0 exiting." >>>;















