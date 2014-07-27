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
// ||              CLASS DECLARATIONS                ||
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
// -3 - -9: Unspecified property setting commands.
// -10 - -16: Drum notes
// -17+: Unspecified.
//
// NOTE DURATION
// Duration values are specified in fractions of a beat,
// speciically, whole number multiples of the
// BEAT_RESOLUTION_FRACTION.

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
                               + "iiiff")
                   @=> OscEvent voice_play_event;
OSC_receiver.event("/lpc/maestro/voice/stop, if")
                   @=> OscEvent voice_stop_event;
OSC_receiver.event(
        "/lpc/maestro/drums/play, ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "ifififififififififififififififif"
                               + "iiff")
                   @=> OscEvent drums_play_event;
OSC_receiver.event("/lpc/maestro/drums/stop, if")
                   @=> OscEvent drums_stop_event;
OSC_receiver.event("/lpc/maestro/tempo, f")
                   @=> OscEvent tempo_event;
OSC_receiver.event("/lpc/maestro/voice/volume, iif")
                   @=> OscEvent voice_volume_event;
OSC_receiver.event("/lpc/maestro/voice/bandpassfilter, iif")
                   @=> OscEvent voice_bandpassfilter_event;
OSC_receiver.event("/lpc/maestro/drums/volume, iiiiiii")
                   @=> OscEvent drums_volume_event;

// ====================================================
// ||                MAESTRO LOGIC                   ||
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
        
// Initialize indices for the ends of assigned voice notes
int voice_end_indices[NUM_VOICES];
        
if (DEBUG_PRINTING)
    <<< "Master loop initialized." >>>;

// DEBUG put debug stuff into the master loop
// for testing purposes
for (0 => int i; i < 16*8; 8 +=> i) {
    // bass drum every beat
    -10 => master_loop[16][i][0];
    0 => master_loop[16][i][1];
    // snare drum
    -11 => master_loop[17][i+4][0];
    0 => master_loop[17][i+4][1];
    -11 => master_loop[17][i+6][0];
    0 => master_loop[17][i+6][1];
    // conga drum
    -12 => master_loop[18][i][0];
    0 => master_loop[18][i][1];
    // tom drum
    -13 => master_loop[19][i][0];
    0 => master_loop[19][i][1];
    // hat drum
    -14 => master_loop[20][i][0];
    0 => master_loop[20][i][1];
    // hit drum
    -15 => master_loop[21][i][0];
    0 => master_loop[21][i][1];
    // ride drum
    -16 => master_loop[22][i][0];
    0 => master_loop[22][i][1];
}
// some voice 1 notes
add_note(4, 25, 1, 0);
add_note(5, 29, 1, 0);
add_note(6, 32, 1, 0);
add_note(7, 29, 1, 0);
add_note(8, 30, 1, 0);
// some voice 2 notes
add_note(4, 29, 1, 1);
add_note(5, 32, 1, 1);
add_note(6, 36, 1, 1);
add_note(7, 32, 1, 1);
add_note(8, 34, 1, 1);
// some voice 3 notes
add_note(4, 32, 1, 2);
add_note(5, 37, 1, 2);
add_note(6, 41, 1, 2);
add_note(7, 37, 1, 2);
add_note(8, 39, 1, 2);
// some voice 4 notes
add_note(4, 37, 1, 3);
add_note(5, 41, 1, 3);
add_note(6, 44, 1, 3);
add_note(7, 41, 1, 3);
add_note(8, 42, 1, 3);
// some voice 5 notes
add_note(4, 41, 1, 4);
add_note(5, 44, 1, 4);
add_note(6, 48, 1, 4);
add_note(7, 44, 1, 4);
add_note(8, 46, 1, 4);
// some voice 6 notes
add_note(4, 44, 1, 5);
add_note(5, 49, 1, 5);
add_note(6, 53, 1, 5);
add_note(7, 49, 1, 5);
add_note(8, 51, 1, 5);
// some voice 7 notes
add_note(4, 20, 0.5, 6);
add_note(4.5, 17, 0.5, 6);
add_note(5, 20, 0.5, 6);
add_note(5.5, 17, 0.5, 6);
add_note(6, 20, 0.5, 6);
add_note(6.5, 17, 0.5, 6);
add_note(7, 20, 0.5, 6);
add_note(7.5, 17, 0.5, 6);
add_note(8, 15, 1, 6);
// some voice 8 notes
add_note(4, 25, 0.5, 7);
add_note(4.5, 20, 0.5, 7);
add_note(5, 25, 0.5, 7);
add_note(5.5, 20, 0.5, 7);
add_note(6, 25, 0.5, 7);
add_note(6.5, 20, 0.5, 7);
add_note(7, 25, 0.5, 7);
add_note(7.5, 20, 0.5, 7);
add_note(8, 18, 1, 7);

function void add_note(float beat,
                       int pitch,
                       float duration_in_beats,
                       int voice) {
    pitch + 35 => master_loop[voice][((beat*8) $ int)][0];
    (duration_in_beats * BEAT_RESOLUTION_DIVIDER) $ int =>
                    master_loop[voice][((beat*8) $ int)][1];
}

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
                }
                else if (noteslot[0] == -1) {  // rest note
                    // I think rests are safe to
                    // ignore currently, but in the future
                    // they may require actual commands
                    // sent to the Pd patch.
                }
                else if (noteslot[0] == -2) {  // set-volume note
                    noteslot[0] => cmd_package[i][0];
                    noteslot[1] => cmd_package[i][1];
                    1 => should_process_packages;
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
// ||         BLOCKYTALKY MESSAGE FUNCTIONS          ||
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
            voice_play_event.getInt()
                                 => message_voice_index;
            voice_play_event.getInt()
                                 => message_should_loop_flag;
            voice_play_event.getInt()
                                 => message_should_overlay_flag;
            voice_play_event.getFloat()
                                 => message_beat_delay;
            voice_play_event.getFloat()
                                 => message_beat_alignment;
            
            // Spawn thread dedicated to updating
            // the master loop using this message
            // data.
            spork ~ play_voice_message_processor(
                    message_phrase_data, message_voice_index,
                    message_should_loop_flag,
                    message_should_overlay_flag,
                    message_beat_delay, message_beat_alignment);
        }
    }
}

function void play_voice_message_processor(
        int phrase_data[], int voice,
        int should_loop_flag, int append_flag,
        float beat_delay, float beat_alignment) {
    
}

function void stop_voice_message_handler_shred() {
    
}

function void play_drums_message_handler_shred() {
    
}

function void stop_drums_message_handler_shred() {
    
}

function void set_tempo_message_handler_shred() {
    
}

function void set_voice_volume_message_handler_shred() {
    
}

function void set_drums_volume_message_handler_shred() {
    
}

function void set_voice_bandpassfilter_message_handler_shred() {
    
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
    <<< "I was told to add a note to the master loop:" >>>;
    <<< "index" + index + "pitch: " + pitch
            + "duration: " + duration + "voice: " + voice >>>;
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
                             => bf_alignment;
        bf_alignment - (start_index % bf_alignment)
                             => offset;
    }
    return (start_index + offset) % MASTER_LOOP_LENGTH_IN_BEATS;
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















