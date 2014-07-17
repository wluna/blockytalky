// Stoppable shred storage
8 => int MAX_SHRED_STORAGE;
Shred @ shreds[MAX_SHRED_STORAGE];
0 => int shreds_length;
string loop_shred_tracker[MAX_SHRED_STORAGE];
string should_exit_tracker[MAX_SHRED_STORAGE];
128 => int PHRASE_SIZE;

// Set up OSC
OscRecv oscReceiver;
1111 => oscReceiver.port;
oscReceiver.listen();
OscSend oscSender;
oscSender.setHost("localhost", 1112);

// BPM
120.0 => float beatsPerMinute;

// Start listening for phrase messages
spork ~ phrase_receive_shred();
spork ~ phrase_receive_on_beat_with_shred();
spork ~ looping_phrase_receive_on_beat_with_shred();
spork ~ on_beat_stop_phrase_handler();

// Set up the main thread to receive TEMPO messages
oscReceiver.event("/lpc/maestro/tempo, f") @=> OscEvent tempo_event;

// Kill time (staying alive) to keep child threads alive
// Here we'll also handle TEMPO message events
while (true) {
    tempo_event => now; // wait for event to arrive
    <<< "Got tempo event." >>>;
    // assign tempo
    while (tempo_event.nextMsg() != 0) {
        tempo_event.getFloat() => beatsPerMinute;
        <<< "BPM set to " + beatsPerMinute >>>;
    }
}

// Phrase-playing event-receiving shred
function void phrase_receive_shred() {
    
    // Set up musical phrase-receiving event
    // message will consist of 128 ints (midi note value)
    // each followed by a float (duration in beats)
    oscReceiver.event("/lpc/maestro/play, ifififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififif") @=> OscEvent phrase_event;
    
    while (true) {
        phrase_event => now; // wait for event signal
        <<< "Got simple play event." >>>;
        
        // arrays for storing phrase data
        int note_pitch_array[PHRASE_SIZE];
        float note_duration_array[PHRASE_SIZE];
        
        // grab messages out of the message queue and
        // store them in two arrays
        while (phrase_event.nextMsg() != 0) {
            for (0 => int i; i < PHRASE_SIZE; i++) {
                phrase_event.getInt() => note_pitch_array[i];
                phrase_event.getFloat() => note_duration_array[i];
            }
        }
        
        // spawn shred dedicated to playing through the
        // given sequence
        spork ~ play_phrase_shred(note_pitch_array, note_duration_array, 0.0, "default", 1);
    }
}

// Phrase-playing event-receiving shred ON BEAT
function void phrase_receive_on_beat_with_shred() {
    
    // Set up musical phrase-receiving event
    // Contains 128 notes, plus a float to specify
    // the beat alignment fraction, plus a string
    // to specify an instrument
    oscReceiver.event("/lpc/maestro/play_on_beat_with, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfs") @=> OscEvent phrase_on_beat_event;
    
    while (true) {
        phrase_on_beat_event => now; // wait for event to arrive
        <<< "Got on-beat play event." >>>;
        
        // arrays for storing phrase data
        int note_pitch_array[PHRASE_SIZE];
        float note_duration_array[PHRASE_SIZE];
        float beat_alignment_fraction;
        string instrument_name;
        
        // grab messages out of the message queue and
        // store them in two arrays
        while (phrase_on_beat_event.nextMsg() != 0) {
            for (0 => int i; i < PHRASE_SIZE; i++) {
                phrase_on_beat_event.getInt() => note_pitch_array[i];
                phrase_on_beat_event.getFloat() => note_duration_array[i];
            }
            phrase_on_beat_event.getFloat() => beat_alignment_fraction;
            phrase_on_beat_event.getString() => instrument_name;
        }
        
        // spawn shred dedicated to playing through the
        // given sequence
        spork ~ play_phrase_shred(note_pitch_array, note_duration_array, beat_alignment_fraction, instrument_name);
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
    oscReceiver.event("/lpc/maestro/loop_on_beat_with, ififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififififfss") @=> OscEvent phrase_on_beat_event;
    
    while (true) {
        phrase_on_beat_event => now; // wait for event to arrive
        <<< "Got on-beat loop play event." >>>;
        
        // arrays for storing phrase data
        int note_pitch_array[PHRASE_SIZE];
        float note_duration_array[PHRASE_SIZE];
        float beat_alignment_fraction;
        string instrument_name;
        string loop_name;
        
        // grab messages out of the message queue and
        // store them in two arrays
        while (phrase_on_beat_event.nextMsg() != 0) {
            for (0 => int i; i < PHRASE_SIZE; i++) {
                phrase_on_beat_event.getInt() => note_pitch_array[i];
                phrase_on_beat_event.getFloat() => note_duration_array[i];
            }
            phrase_on_beat_event.getFloat() => beat_alignment_fraction;
            phrase_on_beat_event.getString() => instrument_name;
            phrase_on_beat_event.getString() => loop_name;
        }
        
        // spawn shred dedicated to looping the given phrase
        // also, store the shred so we can stop it later
        spork ~ loop_phrase_shred(note_pitch_array, note_duration_array, beat_alignment_fraction, instrument_name, loop_name) @=> shreds[shreds_length];
        loop_name => loop_shred_tracker[shreds_length];
        1 +=> shreds_length;
        MAX_SHRED_STORAGE %=> shreds_length;
    }
}

// Phrase-stopping event handler ON BEAT
function void on_beat_stop_phrase_handler() {
    
    // Set up stop message receiving event
    oscReceiver.event("/lpc/maestro/stop_playing_on_beat, fs") @=> OscEvent stop_event;
    
    while (true) {
        stop_event => now; // wait for stop event to arrive
        <<< "Got stop event." >>>;
    
        // vars for storing message data
        float beat_alignment_fraction;
        string loop_name;
        
        // Grab messages out of the message queue and store
        // message data
        while (stop_event.nextMsg() != 0) {
            stop_event.getFloat() => beat_alignment_fraction;
            stop_event.getString() => loop_name;
        }
        
        // Find all shreds that need to be stopped in the shred tracking array
        // based on instrument name matching
        for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
            // Check if shred still exists (id != 0) and also is not null
            <<< shreds[i] >>>;
            if (shreds[i] != null) {
                if (shreds[i].id() != 0) {
                    <<< "shred tracker: " + loop_shred_tracker[i] >>>;
                    <<< "loop name: " + loop_name >>>;
                    if (loop_shred_tracker[i] == loop_name) {
                        // Exit out of any shred that uses this instrument
                        <<< "Match!" >>>;
                        loop_name => should_exit_tracker[i];
                        <<< "Set should_exit_tracker." >>>;
                    }
                }
            }
        }
        
        // Send message to Pd to stop playing this instrument
        // Removed. See the send_stop_message function below. The
        // intention is to send a message to Pd to get it to halt
        // the note it's currently playing (ChucK will stop sending
        // more notes).
    }
}

// Not currently in use as of 7/14/14
function void send_stop_message_for_loop(string loop_name) {
    "/lpc/stop" + loop_name => string address;
    oscSender.startMsg(address + ", s");
    oscSender.addString(loop_name);
    <<< "Stop message sent to " + address + ", attempting to stop " + loop_name >>>;
}

// Actual phrase-playing shred
// use beat_alignment_fraction of 0 to play now
function void play_phrase_shred(int pitches[], float durations[], float alignment_fraction, string instrument_name) {
    // if beat fraction =/= 0
    if (alignment_fraction != 0.0) {
        // calculate time until beat-fraction alignment
        60.0 / beatsPerMinute => float seconds_per_beat;
        seconds_per_beat * alignment_fraction => float align_target;
        
        // synchronize to period of align_target
        <<< "Gonna wait for timing" >>>;
        align_target::second => dur T;
        T - (now % T) => now;
    }
    
    // Start playing phrase
    for (0 => int i; i < PHRASE_SIZE; i++) {
        // Send message to start the note playing
        play_note(pitches[i], durations[i], instrument_name);
        
        // Wait for the note to finish
        (durations[i] / beatsPerMinute * 60)::second => now;
    }
}

// Actual phrase-looping shred
// use beat_alignment_fraction of 0 to play now
function void loop_phrase_shred(int pitches[], float durations[], float alignment_fraction, string instrument_name, string loop_name) {
    // if beat fraction =/= 0
    if (alignment_fraction != 0.0) {
        // calculate time until beat-fraction alignment
        60.0 / beatsPerMinute => float seconds_per_beat;
        seconds_per_beat * alignment_fraction => float align_target;
        
        // synchronize to period of align_target
        <<< "Gonna wait for timing" >>>;
        align_target::second => dur T;
        T - (now % T) => now;
    }
    
    // Start looping phrase
    while (true) {
        for (0 => int i; i < PHRASE_SIZE; i++) {
            // if we shouldn't exit yet
            if (check_should_exit(loop_name)) {
                me.exit();
            }
            else {
                // Send message to start the note playing
                play_note(pitches[i], durations[i], instrument_name);
                
                // Wait for the note to finish
                (durations[i] / beatsPerMinute * 60)::second => now;
            }
        }
    }
}

function int check_should_exit(string instrument_name) {
    for (0 => int i; i < MAX_SHRED_STORAGE; i++) {
        if (should_exit_tracker[i] == instrument_name) {
            "" => should_exit_tracker[i];
            <<< "Cleared should_exit_tracker at " + i >>>;
            return 1;
        }
    }
    return 0;
}

// Playing a note with a specific instrument
function void play_note(int pitch, float duration, string instrument_name) {
    // play if note is not silent
    if (pitch != -1) {
        "/lpc/sound/" + instrument_name => string address;
        oscSender.startMsg(address + ", i, f");
        oscSender.addInt(pitch);
        oscSender.addFloat(duration * (60.0 / beatsPerMinute));
        <<< "Message sent with pitch " + pitch + " and duration " + duration + " and instrument " + instrument_name>>>;
    }
}
