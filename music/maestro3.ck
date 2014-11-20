//TODO
// 1. Fix up voices to work

//FUTURE THOUGHTS
//1.  Do drums needs pitches?
//2.  is it worth starting up  a shred to send an osc 
//	      signal or should it be sent directly from function
//3.  Should one be alloud to have drum and synth on same voice
//4.  Remove bandpass filter and replace with number signifying the effect number
//5.  Make global effect as well if voice value is 9
//6.  Init removed so new blocky talky does not stop whole rest

// ====================================================
// ||           CONSTANTS & CONFIGURATION            ||
// ====================================================
class BeatEvent extends Event
{
    float beat_fraction;
}

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
// Alternatively, if you just want to make sure ChucK
// is alive while operating with it, you can set it
// to 1, which will print messages every time a note
// is sent, instead of full debugging messages.
2 => int DEBUG_PRINTING;
// 0 - No printing
// 1 - Message-send receipts only
// 2 - Full debug printing

// Assign current tempo in BPM
DEFAULT_TEMPO => float tempo;

(1.0 / (tempo / 60.0)) =>float seconds_per_beat_as_float;
(1.0 / (tempo / 60.0))::second  => dur seconds_per_beat;

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
OSC_receiver.event(
        "/lpc/maestro/drums/play, iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiif")
                   @=> OscEvent drums_play_event;
OSC_receiver.event("/lpc/maestro/stop, if")
                   @=> OscEvent stop_event;
OSC_receiver.event("/lpc/maestro/tempo, f")
                   @=> OscEvent tempo_event;
OSC_receiver.event("/lpc/maestro/voice/volume, ii")
                   @=> OscEvent voice_volume_event;
OSC_receiver.event("/lpc/maestro/voice/instrument, ii")
                   @=> OscEvent voice_instrument_event;
OSC_receiver.event("/lpc/maestro/voice/bandpassfilter, ii")
                   @=> OscEvent voice_bandpassfilter_event;
OSC_receiver.event("/lpc/maestro/drums/volume, i")
                   @=> OscEvent drums_volume_event;
OSC_receiver.event("/lpc/maestro/init, i")
                   @=> OscEvent init_event;

spork ~ watch_drum_event_shred();
spork ~ watch_voice_event_shred();
spork ~ watch_set_tempo_event_shred();
spork ~ watch_set_voice_volume_shred();
spork ~ watch_set_voice_instrument_shred();
spork ~ watch_set_voice_bandpassfilter_shred();//Should become even shred
spork ~ watch_set_drums_volume_shred();
spork ~ watch_stop_event_shred();
spork ~ broadcast();



Shred voice_shreds[8][2];
Shred drum_shreds[8][2];//1 = active / 2 = upcoming

BeatEvent beat_event;


function void watch_drum_event_shred() {
		// Initialize message data buffers.
		8 => int ints_per_drum; //  the number of 32-bit integers used
	
	while (true) {
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
		// Receive messages.
		drums_play_event => now;
		
		// DEBUG Print message receipt.
		if (DEBUG_PRINTING == 2) {
			<<< "Received drums_play_event." >>>;
		}
			
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
			message_beat_alignment) @=>  drum_shreds[message_voice_index][1];
		}
	}
}

function void watch_voice_event_shred() {
	while (true) {
		// Receive messages.
		voice_play_event => now;
		
		// DEBUG Print message receipt.
		if (DEBUG_PRINTING == 2) {
			<<< "Received voice_play_event." >>>;
		}
		
		// Initialize message data buffers.
		int phrase_data[128][2];
		int voice;
		int should_loop_flag;
		int message_should_overlay_flag;
		float beat_delay;
		float beat_alignment;
		
		// Process each message.
		while (voice_play_event.nextMsg() != 0) {
			
			// Read message data into buffers.
			for (0 => int i; i < 128; i++) {
				voice_play_event.getInt()
				=> phrase_data[i][0];
				parse_duration(voice_play_event.getFloat())
				=> phrase_data[i][1];
			}
			voice_play_event.getInt() - 1
			=> voice;
			voice_play_event.getInt()
			=> should_loop_flag;
			voice_play_event.getFloat()
			=> beat_alignment;
			
			// Spawn thread dedicated to updating
			// the master loop using this message
			// data.
			spork ~ play_voice_message_processor(
			phrase_data, voice, should_loop_flag,
			beat_alignment);
		}
	}
}

function void watch_stop_event_shred() {
    while (true) {
        // Receive message(s).
        stop_event => now;
        
        // DEBUG Print message receipt.
        if (DEBUG_PRINTING == 2) {
            <<< "Received stop_event." >>>;
        }
        
        // Initialize message data buffers.
        int message_voice_index;
        float message_beat_alignment;
        
        // Process each message in the queue.
        while (stop_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            stop_event.getInt() - 1
                                 => message_voice_index;
            stop_event.getFloat()
                                 => message_beat_alignment;
            
            // Actually process the event.
            spork ~ stop_voice(
                    message_voice_index, message_beat_alignment);
        }
    }
}

function void watch_set_voice_volume_shred() {
    while (true) {
        // Receive message(s).
        voice_volume_event => now;
        
        // DEBUG Print message recept.
        if (DEBUG_PRINTING == 2) {
            <<< "Received voice_volume_event." >>>;
        }
        // Initialize message data buffers.
        int message_voice;
        int message_value;
        
        // Process each message in the queue.
        while (voice_volume_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            voice_volume_event.getInt() => message_voice;
            voice_volume_event.getInt() => message_value;

            "/lpc/sound/voice" + message_voice + "/volume" =>
                                            string address;
    		OSC_sender.startMsg(address + ", i");
    		OSC_sender.addInt(message_value);
    		if (DEBUG_PRINTING) {
        		<<< "Volume message sent to voice " + message_voice
                + " with value " + message_value >>>;
            }
        }
    }
}

function void watch_set_voice_instrument_shred() {
    while (true) {
        // Receive message(s).
        voice_instrument_event => now;
        
        // DEBUG Print message recept.
        if (DEBUG_PRINTING == 2) {
            <<< "Received voice_instrument_event." >>>;
        }   
        // Initialize message data buffers.
        int message_voice;
        int message_value;
        string address;
        
        // Process each message in the queue.
        while (voice_instrument_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            voice_instrument_event.getInt() => message_voice;
            voice_instrument_event.getInt() => message_value;

    		"/lpc/sound/voice" + message_voice + "/instrument" =>
                                             address;
    		OSC_sender.startMsg(address + ", i");
    		OSC_sender.addInt(message_value);
    		if (DEBUG_PRINTING) {
        		<<< "Instrument message sent to voice " + message_voice
          		      + " with value " + message_value >>>;
   			}
		}
	}
}

function void watch_set_drums_volume_shred() {
	while (true) {
		drums_volume_event => now;
		
		// DEBUG Print message recept.
		if (DEBUG_PRINTING == 2) {
            <<< "Received drums_volume_event." >>>;
		}
		
		int message_value;
        string address;
		// Process each message in the queue.
		while (drums_volume_event.nextMsg() != 0) {
			
			drums_volume_event.getInt() => message_value;
			
			"/lpc/sound/drums/volume" => address;
			OSC_sender.startMsg(address + ", i");
			OSC_sender.addInt(message_value);
			if (DEBUG_PRINTING) {
				<<< "Drum volume message sent with value " + message_value >>>;
			}
		}
	}
}

function void watch_set_voice_bandpassfilter_shred() {
	 // Initialize message data buffers.
	int message_voice;
    int message_value;
    string address;

    while (true) {
        // Receive message(s).
        voice_bandpassfilter_event => now;
        
        // DEBUG Print message recept.
        if (DEBUG_PRINTING == 2) {
            <<< "Received voice_bandpassfilter_event." >>>;
        }
        // Process each message in the queue.
        while (voice_bandpassfilter_event.nextMsg() != 0) {
            
            // Read message data into buffers.
            voice_bandpassfilter_event.getInt() => message_voice;
            voice_bandpassfilter_event.getInt() => message_value;
            
            // Actually process the event.
            "/lpc/sound/voice" + message_voice + "/bandpassfilter" => address;
                                            
    		OSC_sender.startMsg(address + ", i");
    		OSC_sender.addInt(message_value);
    		if (DEBUG_PRINTING) {
        		<<< "Bandpassfilter message sent to voice " + message_voice
                	+ " with value " + message_value >>>;
            }
        }
    }
}

function void watch_set_tempo_event_shred(){
    while(true){
        tempo_event => now;
        if(DEBUG_PRINTING){
            <<< "received tempo event.">>>;
        }
        while(tempo_event.nextMsg() != 0){
            tempo_event.getFloat() => tempo; //making the decision to combine this into one shred.
            
            (1.0 / (tempo / 60.0))::second => seconds_per_beat;
            (1.0 / (tempo / 60.0)) =>seconds_per_beat_as_float ;
        }
        if(DEBUG_PRINTING){
            <<< "processed tempo event.">>>;
        }
    }
}

function void play_voice_message_processor(
int note_package[][], int voice,
int should_loop_flag, float beat_alignment) {
	
	float duration;
	string address;
	int pitch;

	wait_and_kill(beat_alignment, voice_shreds[voice]);
	
	while(true){
		for (0 => int i; i < 128; i++) {
			if (note_package[i][1] != 0) {
				"/lpc/sound/voice" + (voice+1) + "/play" => 
				address;
				note_package[i][0] => pitch;
				beat_fractions_to_seconds(note_package[i][1])*BEAT_RESOLUTION_FRACTION =>
				duration;
				OSC_sender.startMsg(address + ", i, f");
				OSC_sender.addInt(pitch);
				OSC_sender.addFloat(duration);
				if (DEBUG_PRINTING) {
					// DEBUG print message sent
					<<< "Note sent with pitch " + pitch
					+ " and duration "
					+ duration >>>;
				}
				duration :: second => now;
			}
		}
		if(should_loop_flag == 0){
			break;
		}
	}
}

// Turn into 1D array in future if [x][1] is never used
function void play_drums_message_processor(int bass_data[],
int snare_data[], int conga_data[], int tom_data[],
int hat_data[], int hit_data[], int ride_data[],
int should_loop, int voice, int length,
float beat_alignment){  
    if (DEBUG_PRINTING == 2) {
        <<< "Drum Message Processor." >>>;
    }
	int drum_package[NUM_DRUMS];
	string address;

	wait_and_kill(beat_alignment, drum_shreds[voice]);
    if (DEBUG_PRINTING == 2) {
        <<< "Play some drums" >>>;
    }
	while(true){
		for (0 => int i; i < 16 * length; i++) {
			// Get whether to trigger the bass.
			bit_value_at(bass_data[i / 32], i % 32) => drum_package[0];
			// Get whether to trigger the snare.
			bit_value_at(snare_data[i / 32], i % 32) => drum_package[1];
			// Get whether to trigger the conga.
			bit_value_at(conga_data[i / 32], i % 32) => drum_package[2];
			// Get whether to trigger the tom.
			bit_value_at(tom_data[i / 32], i % 32) => drum_package[3];
			// Get whether to trigger the hat.
			bit_value_at(hat_data[i / 32], i % 32) => drum_package[4];
			// Get whether to trigger the hit.
			bit_value_at(hit_data[i / 32], i % 32) => drum_package[5];
			// Get whether to trigger the ride.
			bit_value_at(ride_data[i / 32], i % 32) => drum_package[6];  
						
			"/lpc/sound/drums/play, i, i, i, i, i, i, i"
			=>  address;
			
			OSC_sender.startMsg(address);
			
			for (0 => int i; i < NUM_DRUMS; i++) {
				OSC_sender.addInt(drum_package[i]);
			} 
			
			if (DEBUG_PRINTING) {
				// DEBUG print message sent
				<<< "drum message sent: " 
				+ drum_package[0] + ", "
				+ drum_package[1] + ", "
				+ drum_package[2] + ", "
				+ drum_package[3] + ", "
				+ drum_package[4] + ", "
				+ drum_package[5] + ", "
				+ drum_package[6] >>>;
			}
			
			//THIS IS WHEN WE NEED TO WAIT 
			//TODO This could be optimized by placing earlier in the code
			seconds_per_beat * BEAT_RESOLUTION_FRACTION
            => now;
			
		}
		if(should_loop == 0){
			break;
		}
	}
}

function void stop_voice(
        int voice, float beat_alignment) {
        
        if(beat_alignment != 0.0){
            float beat_f_adj;
            do{
                beat_event => now;
                beat_event.beat_fraction + BEAT_RESOLUTION_FRACTION => beat_f_adj;
                if(beat_f_adj == 0.0){
                    beat_alignment - 1.0 => beat_alignment;
                }
            }
            while(beat_alignment > 1 || beat_f_adj % beat_alignment != 0.0);        
        }
    
    if (DEBUG_PRINTING == 2) {
        <<< "Stop message done waiting. ">>>;
    }
    voice_shreds[voice][0].exit();
    voice_shreds[voice][1].exit();
	drum_shreds[voice][0].exit();
    drum_shreds[voice][1].exit();

	NULL @=> voice_shreds[voice][0];
	NULL @=> voice_shreds[voice][1];
	NULL @=> drum_shreds[voice][0];
	NULL @=> drum_shreds[voice][1];
}

function void wait_and_kill(float beat_alignment, Shred this_shred[]){
    if(beat_alignment != 0.0){
        float beat_f_adj;
        do{
            beat_event => now;
            (beat_event.beat_fraction + BEAT_RESOLUTION_FRACTION) % 1.0 => beat_f_adj;
            if(beat_f_adj == 0.0){
                beat_alignment - 1.0 => beat_alignment;
            }
        }
        while(beat_alignment > 1 || beat_f_adj % beat_alignment != 0.0);        
    }
    //possibly wait half a 1/32nd
    this_shred[0].exit();
	me @=> this_shred[0];
	Shred @ foo;
	foo @=> this_shred[1];
    if(beat_alignment != 0){
        beat_event =>now;
    }
    if (DEBUG_PRINTING == 2) {
        <<< "finished w&k"  >>>;
    }
}
function void broadcast(){
	0.0 => float beat_f;
    while(true){
        beat_f =>beat_event.beat_fraction;
		beat_event.broadcast();
		(beat_f + BEAT_RESOLUTION_FRACTION) % 1.0 => beat_f;
		seconds_per_beat * BEAT_RESOLUTION_FRACTION => now;
    }
}

// bit_value_at
// Returns a 1 or a 0 depending on the bit-state of the
// binary representation of the integer at the specified
// bit index (little-endian).
// In other words, an index of N returns the 2^Nth bit.
function int bit_value_at(int input_number, int index) {
	1 => int mask;
	0 => int bit;
	for (0 => int j; j < index; j++) {
		mask << 1 => mask;
	}
	input_number & mask => bit;
	for (0 => int j; j < index; j++) {
		bit >> 1 => bit;
	}
	return bit;
}

// ====================================================
// ||                HELPER FUNCTIONS                ||
// ====================================================
// beat_fraction_to_seconds(int duration)
// Converts internally-represented duration in beat
// fractions (BEAT_RESOLUTION_FRACTION) to a float
// representing duration in seconds.
// Relies on seconds_per_beat_as_float.
function float beat_fractions_to_seconds(float duration) {
	return duration
	* seconds_per_beat_as_float;
}

// parse_duration(float duration_in_beats)
// Converts an input float representing duration
// in beats to the closest corresponding number
// of atomic fractional beats for use in master
// loop assignment.
function int parse_duration(float duration_in_beats) {
	return ((duration_in_beats * BEAT_RESOLUTION_DIVIDER) $ int);
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