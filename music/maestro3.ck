function void watch_drum_events_shread(){
    while (true) {
        // Receive messages.
        drums_play_event => now;
        spork ~ process_drum_event(drum_play_event);
    }
}

function void process_drum_event(Event drum_play_event){
if (DEBUG_PRINTING == 2) {
    <<< "Received drums_play_event." >>>;
}

// Initialize message data buffers.
8 => int ints_per_drum; //  the number of 32-bit integers used
//  to store phrase data for each drum
int message_bass_data[ints_per_drum];
int message_snare_data[ints_per_drum];
int message_conga_data[ints_per_drum];
int message_tom_data[ints_per_drum];
int message_hat_data[ints_per_drum];
int message_hit_data[ints_per_drum];
int message_ride_data[ints_per_drum];
int message_voice_index;
int message_should_loop_flag;
int message_phrase_length;
float message_beat_alignment;

// Process each message.
while (drums_play_event.nextMsg() != 0) {
    
    // Read message data into buffers.
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_bass_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_snare_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_conga_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_tom_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_hat_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_hit_data[i];
    }
    for (0 => int i; i < ints_per_drum; i++) {
        drums_play_event.getInt()
        => message_ride_data[i];
    }
    drums_play_event.getInt() - 1
    => message_voice_index;
    drums_play_event.getInt()
    => message_should_loop_flag;
    drums_play_event.getInt()
    => message_phrase_length;
    drums_play_event.getFloat()
    => message_beat_alignment;
    
    // Spawn thread dedicated to updating
    // the master loop using this message
    // data.
    spork ~ play_drums_message_processor(
    message_bass_data, message_snare_data,
    message_conga_data, message_tom_data,
    message_hat_data, message_hit_data,
    message_ride_data,
    message_should_loop_flag,
    message_voice_index,
    message_phrase_length,
    message_beat_alignment);
}
}
}

**THis is how drum notes are put into a package
else if (noteslot[0] <= -10
&& noteslot[0] >= -16) {  // drum note
    1 => drum_package
    [drumnote_from_pitch(noteslot[0])]
    [0];
    1 => should_process_packages;
    


// Turn into 1D array in future if [x][1] is never used
function void play_drums_message_processor(int bass_data[],
int snare_data[], int conga_data[], int tom_data[],
int hat_data[], int hit_data[], int ride_data[],
int should_loop, int voice, int length,
float beat_alignment){   
            
            
            for (0 => int i; i < 16 * length; i++) {
                // Get whether to trigger the bass.
                bit_value_at(bass_data[i / 32], i % 32) => int bass;
                // Get whether to trigger the snare.
                bit_value_at(snare_data[i / 32], i % 32) => int snare;
                // Get whether to trigger the conga.
                bit_value_at(conga_data[i / 32], i % 32) => int conga;
                // Get whether to trigger the tom.
                bit_value_at(tom_data[i / 32], i % 32) => int tom;
                // Get whether to trigger the hat.
                bit_value_at(hat_data[i / 32], i % 32) => int hat;
                // Get whether to trigger the hit.
                bit_value_at(hit_data[i / 32], i % 32) => int hit;
                // Get whether to trigger the ride.
                bit_value_at(ride_data[i / 32], i % 32) => int ride;  
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

function void watch_voice_events_shread(){
    while (true) {
        // Receive messages.
        voice_play_event => now;
        spork ~ process_voice_event(voice_play_event);
    }
}