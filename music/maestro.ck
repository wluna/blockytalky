// Stoppable shred storage
24 => int MAX_SHRED_STORAGE;
Shred @ shreds[MAX_SHRED_STORAGE];
0 => int shreds_length;
int loop_shred_tracker[MAX_SHRED_STORAGE];
int should_exit_tracker[MAX_SHRED_STORAGE];
128 => int PHRASE_SIZE;

now => time zero_time;

// Set up OSC
OscRecv oscReceiver;
1111 => oscReceiver.port;
oscReceiver.listen();
OscSend oscSender;
oscSender.setHost("localhost", 1112);

// BPM
120.0 => float beatsPerMinute;

// Start listening for phrase messages
spork ~ phrase_receive_on_beat_with_shred();
spork ~ looping_phrase_receive_on_beat_with_shred();
spork ~ on_beat_stop_phrase_handler();
spork ~ on_beat_change_voice_handler();
spork ~ on_beat_change_voice_handler_drums();
spork ~ set_instrument_handler();
spork ~ set_volume_handler();
spork ~ set_bandpassfilter_handler();

// Set up the main thread to receive TEMPO messages
oscReceiver.event("/lpc/maestro/tempo, f") @=> OscEvent tempo_event;

// Must kill time (staying alive) to keep child threads alive
// Here we'll also handle TEMPO message events
while (true) {
    tempo_event => now; // wait for event to arrive
    <<< "Got tempo event." >>>;
    // assign tempo
    while (tempo_event.nextMsg() != 0) {
        // Get data from event message
        tempo_event.getFloat() => beatsPerMinute;
        
        <<< "BPM set to " + beatsPerMinute >>>;
    }
}

// Phrase-playing STOPPABLE event-receiving shred ON BEAT
function void phrase_receive_on_beat_with_shred() {
    
    // Set up musical phrase-receiving event
    // Contains 128 notes, plus a float to specify
    // the beat alignment fraction, plus an int
    // to specify which voice to use
    oscReceiver.event("/lpc/maestro/play_on_beat_with, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfi") @=> OscEvent phrase_on_beat_event;
    
    while (true) {
        phrase_on_beat_event => now; // wait for event to arrive
        <<< "Got on-beat play event." >>>;
        
        // grab messages out of the message queue and
        // store them in two arrays
        while (phrase_on_beat_event.nextMsg() != 0) {
            
            // arrays for storing phrase data
            int note_pitch_array[PHRASE_SIZE];
            float note_duration_array[PHRASE_SIZE];
            float beat_alignment_fraction;
            int voice_index;
            
            <<< "Operating on event." >>>;
            for (0 => int i; i < PHRASE_SIZE; i++) {
                phrase_on_beat_event.getInt() => note_pitch_array[i];
                phrase_on_beat_event.getFloat() => note_duration_array[i];
            }
            phrase_on_beat_event.getFloat() => beat_alignment_fraction;
            phrase_on_beat_event.getInt() => voice_index;
        
            // spawn shred dedicated to playing through the
            // given sequence
            // also, store the shred so we can stop it later
            spork ~ play_phrase_shred(note_pitch_array, note_duration_array, beat_alignment_fraction, voice_index);
            voice_index => loop_shred_tracker[shreds_length];
            1 +=> shreds_length;
            MAX_SHRED_STORAGE %=> shreds_length;
        }
    }
}

// Phrase-playing LOOPING, STOPPABLE event-receiving shred ON BEAT
function void looping_phrase_receive_on_beat_with_shred() {
    
    // Set up musical phrase-receiving event
    // Contains 64 notes, plus a float to specify
    // the beat alignment fraction, plus a string
    // to specify an instrument. This function
    // listens on a "loop" address instead of just
    // a play address.
    oscReceiver.event("/lpc/maestro/loop_on_beat_with, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfi") @=> OscEvent phrase_on_beat_event;
    
    while (true) {
        phrase_on_beat_event => now; // wait for event to arrive
        <<< "Got on-beat loop play event." >>>;
        
        // grab messages out of the message queue and
        // store them in two arrays
        while (phrase_on_beat_event.nextMsg() != 0) {
        
            // arrays for storing phrase data
            int note_pitch_array[PHRASE_SIZE];
            float note_duration_array[PHRASE_SIZE];
            float beat_alignment_fraction;
            int voice_index;
            
            for (0 => int i; i < PHRASE_SIZE; i++) {
                phrase_on_beat_event.getInt() => note_pitch_array[i];
                phrase_on_beat_event.getFloat() => note_duration_array[i];
            }
            phrase_on_beat_event.getFloat() => beat_alignment_fraction;
            phrase_on_beat_event.getInt() => voice_index;
        
            // spawn shred dedicated to looping the given phrase
            // also, store the shred so we can stop it later
            spork ~ loop_phrase_shred(note_pitch_array, note_duration_array, beat_alignment_fraction, voice_index) @=> shreds[shreds_length];
            voice_index => loop_shred_tracker[shreds_length];
            1 +=> shreds_length;
            MAX_SHRED_STORAGE %=> shreds_length;
        }
    }
}

// Phrase-stopping event handler ON BEAT
function void on_beat_stop_phrase_handler() {
    
    // Set up stop message receiving event
    oscReceiver.event("/lpc/maestro/stop_playing_on_beat, fi") @=> OscEvent stop_event;
    
    while (true) {
        stop_event => now; // wait for stop event to arrive
        <<< "Got stop event." >>>;
    
        // vars for storing message data
        float beat_alignment_fraction;
        int voice_index;
        
        // Grab messages out of the message queue and store
        // message data
        while (stop_event.nextMsg() != 0) {
            stop_event.getFloat() => beat_alignment_fraction;
            stop_event.getInt() => voice_index;
        }
        
        // Find all shreds that need to be stopped in the shred tracking array
        // based on voice index matching
        // But first wait for beat alignment if necessary
        wait_until_alignment(beat_alignment_fraction);
        for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
            // Check if shred still exists (id != 0) and also is not null
            if (shreds[i] != null) {
                if (shreds[i].id() != 0) {
                    if (loop_shred_tracker[i] == voice_index) {
                        // Exit out of any shred that uses this instrument
                        voice_index => should_exit_tracker[i];
                    }
                }
            }
        }
    }
}

// Voice phrase-changing event handler ON BEAT
function void on_beat_change_voice_handler() {
    
    // Set up voice change message receiving event
    oscReceiver.event("/lpc/maestro/change_voice, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfi") @=> OscEvent voice_change_event;
    
    while (true) {
        voice_change_event => now; // wait for voice change event to arrive
        <<< "Got voice change event." >>>;
    
        // vars for storing message data
        int note_pitch_array[PHRASE_SIZE];
        float note_duration_array[PHRASE_SIZE];
        float beat_alignment_fraction;
        int voice_index;
        
        // Grab messages out of the message queue and store
        // message data
        while (voice_change_event.nextMsg() != 0) {
            for (0 => int i; i < PHRASE_SIZE; i++) {
                voice_change_event.getInt() => note_pitch_array[i];
                voice_change_event.getFloat() => note_duration_array[i];
            }
            voice_change_event.getFloat() => beat_alignment_fraction;
            voice_change_event.getInt() => voice_index;
        }
        
        // To change a phrase that is currently playing, we'll stop
        // the voice (as if a stop message was received for that phrase)
        // and then immediately start a new phrase with the same voice
        // and the new message data.
        
        // First, stop the voice:
        // Find all shreds that need to be stopped in the shred tracking array
        // based on instrument name matching
        // But first wait for beat alignment if necessary
        wait_until_alignment(beat_alignment_fraction);
        for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
            // Check if shred still exists (id != 0) and also is not null
            if (shreds[i] != null) {
                if (shreds[i].id() != 0) {
                    if (loop_shred_tracker[i] == voice_index) {
                        // Exit out of any shred that uses this instrument
                        voice_index => should_exit_tracker[i];
                    }
                }
            }
        }
        
        // With should_exit_tracker set, the voice will be stopped by the 
        // phrase-playing thread(s) currently playing with that voice. Now we
        // start the new shred to play the new phrase.
        // Pass 0.0 as beat alignment fraction because we already waited up above!!
        spork ~ loop_phrase_shred(note_pitch_array, note_duration_array, 0.0, voice_index) @=> shreds[shreds_length];
        voice_index => loop_shred_tracker[shreds_length];
        1 +=> shreds_length;
        MAX_SHRED_STORAGE %=> shreds_length;
    }
}

// Voice phrase-changing event handler ON BEAT -- FOR DRUMS
function void on_beat_change_voice_handler_drums() {
    
    // Set up voice change message receiving event
    oscReceiver.event("/lpc/maestro/change_voice_drums, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfi") @=> OscEvent voice_change_event;
    
    // There are seven distinct drum sounds, and each is considered
    // its own loop. So doing a "change voice" on a drumline is more
    // complicated bcause it must happen simultaneously for seven
    // different voices.
    7 => int NUM_DRUMS;
    0 => int num_drums_loaded; // index tracking, when this is 7 the arrays are full
    
    while (true) {
        voice_change_event => now; // wait for voice change event to arrive
        <<< "Got on-beat DRUM voice change event." >>>;
    
        // vars for storing message data
        int drums_note_pitch_array[NUM_DRUMS][PHRASE_SIZE];
        float drums_note_duration_array[NUM_DRUMS][PHRASE_SIZE];
        float drums_beat_alignment_fraction[NUM_DRUMS];
        int drums_voice_index[NUM_DRUMS];
        
        // Grab messages out of the message queue and store
        // message data
        while (voice_change_event.nextMsg() != 0) {
            <<< "Operating on DRUM voice change event." >>>;
            for (0 => int i; i < PHRASE_SIZE; i++) {
                voice_change_event.getInt() => drums_note_pitch_array[num_drums_loaded][i];
                voice_change_event.getFloat() => drums_note_duration_array[num_drums_loaded][i];
            }
            voice_change_event.getFloat() => drums_beat_alignment_fraction[num_drums_loaded];
            voice_change_event.getInt() => drums_voice_index[num_drums_loaded];
            1 +=> num_drums_loaded;
        }
        
        // We're finished loading all of the data of a new drumline
        // if the number of drums loaded is 7, otherwise we must
        // continue to wait for more drum data to arrive.
        if (num_drums_loaded == 7) {
            <<< "All drums loaded. Performing change... " >>>;
            0 => num_drums_loaded;
            
            // To change a phrase that is currently playing, we'll stop
            // the voice (as if a stop message was received for that phrase)
            // and then immediately start a new phrase with the same voice
            // and the new message data.
            
            // First, stop the voice:
            // Find all shreds that need to be stopped in the shred tracking array
            // based on instrument name matching
            // But first wait for beat alignment if necessary
            wait_until_alignment(drums_beat_alignment_fraction[0]);  // all drums must be aligned to the same beat D:<
            for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
                // Check if shred still exists (id != 0) and also is not null
                if (shreds[i] != null) {
                    if (shreds[i].id() != 0) {
                        if (loop_shred_tracker[i] == drums_voice_index[0]) {  // all drums must also be on the same voice D:<
                            // Exit out of any shred that uses this instrument
                            drums_voice_index[0] => should_exit_tracker[i];
                        }
                    }
                }
            }
            
            // Now we yield computation time to other shreds
            // This gives the exit-tracking shred time to remove all
            // voices set in the exit tracker before we start the new voice
            <<< "Voice change shred: Yielding for exiting shreds." >>>;
            me.yield();
            
            // With should_exit_tracker set, the voice will be stopped by the 
            // phrase-playing thread(s) currently playing with that voice. Now we
            // start the new shred to play the new phrase.
            // Pass 0.0 as beat alignment fraction because we already waited up above!!
            // We must do this seven times to add all seven types of drums as their own loops.
            for (0 => int i; i < NUM_DRUMS; i++) {
                spork ~ loop_phrase_shred(drums_note_pitch_array[i], drums_note_duration_array[i], 0.0, drums_voice_index[i]) @=> shreds[shreds_length];
                drums_voice_index[i] => loop_shred_tracker[shreds_length];
                1 +=> shreds_length;
                MAX_SHRED_STORAGE %=> shreds_length;
            }
            <<< "Voice change shred action complete" >>>;
        }
    }
}

// Actual phrase-playing shred
// use beat_alignment_fraction of 0 to play now
function void play_phrase_shred(int pitches[], float durations[], float alignment_fraction, int voice_index) {
    // wait for beat alignment
    wait_until_alignment(alignment_fraction);
    
    // Start playing phrase
    for (0 => int i; i < PHRASE_SIZE; i++) {
        
        // Send message to start the note playing
        play_note(pitches[i], durations[i], voice_index);
        
        // Wait for the note to finish
        (durations[i] / beatsPerMinute * 60)::second => now;
    }
}

function void wait_until_alignment(float alignment_fraction) {
    if (alignment_fraction == 0.0) {
        return;
    }
    else {
        // calculate time until beat-fraction alignment
        60.0 / beatsPerMinute => float seconds_per_beat;
        seconds_per_beat * alignment_fraction => float align_target;
        
        // synchronize to period of align_target
        <<< "Gonna wait for timing" >>>;
        align_target::second => dur T;
        T - ((now - zero_time) % T) => now;
    }
}

// Actual phrase-looping shred
// use beat_alignment_fraction of 0 to play now
function void loop_phrase_shred(int pitches[], float durations[], float alignment_fraction, int voice_index) {
    // wait for beat alignment
    wait_until_alignment(alignment_fraction);
    
    // Start looping phrase
    while (true) {
        for (0 => int i; i < PHRASE_SIZE; i++) {
            // if we shouldn't exit yet
            if (check_should_exit(voice_index)) {
                me.exit();
            }
            else {
                // Send message to start the note playing
                if (pitches[i] != -1) {
                    play_note(pitches[i], durations[i], voice_index);
                }
                
                // Wait for the note to finish
                (durations[i] / beatsPerMinute * 60)::second => now;
                
                // stop the note
                if (pitches[i] != -1) {
                    stop_note(voice_index);
                }
            }
        }
    }
}

function int check_should_exit(int voice_index) {
    for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
        if (should_exit_tracker[i] == voice_index) {
            0 => should_exit_tracker[i];
            <<< "Cleared should_exit_tracker at " + i >>>;
            return 1;
        }
    }
    return 0;
}

// Playing a note with a specific instrument
function void play_note(int pitch, float duration, int voice_index) {
    // play if note is not silent
    if (pitch != -1) {
        "/lpc/sound/voice" + voice_index + "/play" => string address;
        if (pitch <= -10) { // drum support
            "/lpc/sound/voice" + voice_index + "/drums/play" => address;
        }
        oscSender.startMsg(address + ", i, f");
        oscSender.addInt(pitch);
        oscSender.addFloat(duration * (60.0 / beatsPerMinute));
        <<< "Address: " + address >>>;
        <<< "Note sent with pitch " + pitch + " and duration " + duration + " and voice " + voice_index>>>;
    }
}

// Stopping a note
function void stop_note(int voice_index) {
    "/lpc/sound/voice" + voice_index + "/stop" => string address;
    oscSender.startMsg(address + ", i");
    oscSender.addInt(voice_index);
    <<< "Note stopped" >>>;
}

function void set_instrument_handler() {
    oscReceiver.event("/lpc/maestro/instrument, ii") @=> OscEvent set_instrument_event;
    
    while (true) {
        set_instrument_event => now; // wait for event to arrive
        <<< "Got set instrument event." >>>;
    
        int voice_index;
        int instrument_index;
        
        while (set_instrument_event.nextMsg() != 0) {
            set_instrument_event.getInt() => voice_index;
            set_instrument_event.getInt() => instrument_index;
            
            oscSender.startMsg("/lpc/sound/voice" + voice_index + "/instrument, i");
            oscSender.addInt(instrument_index);
            <<< "Instrument message passed along." >>>;
        }
    }
}

function void set_volume_handler() {
    oscReceiver.event("/lpc/maestro/volume, if") @=> OscEvent set_volume_event;
    
    while (true) {
        set_volume_event => now; // wait for event to arrive
        <<< "Got set volume event." >>>;
    
        int voice_index;
        float volume_arg;
        
        while (set_volume_event.nextMsg() != 0) {
            set_volume_event.getInt() => voice_index;
            set_volume_event.getFloat() => volume_arg;
            
            oscSender.startMsg("/lpc/sound/voice" + voice_index + "/volume, f");
            oscSender.addFloat(volume_arg);
            <<< "Volume message passed along." >>>;
        }
    }
}

function void set_bandpassfilter_handler() {
    oscReceiver.event("/lpc/maestro/bandpassfilter, if") @=> OscEvent set_bandpassfilter_event;
    
    while (true) {
        set_bandpassfilter_event => now; // wait for event to arrive
        <<< "Got set bandpassfilter event." >>>;
    
        int voice_index;
        float property_arg;
        
        while (set_bandpassfilter_event.nextMsg() != 0) {
            set_bandpassfilter_event.getInt() => voice_index;
            set_bandpassfilter_event.getFloat() => property_arg;
            
            oscSender.startMsg("/lpc/sound/voice" + voice_index + "/bandpassfilter, f");
            oscSender.addFloat(property_arg);
            <<< "Bandpassfilter message passed along." >>>;
        }
    }
}
