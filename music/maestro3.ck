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
1 => int DEBUG_PRINTING;
// 0 - No printing
// 1 - Message-send receipts only
// 2 - Full debug printing


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

function void watch_drum_events_shread(){
	while (true) {
		// Receive messages.
		drums_play_event => now;
		spork ~ process_drum_event(drums_play_event);
	}
}

spork ~ watch_drum_events_shread();


function void process_drum_event(OscEvent e){
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
	while (e.nextMsg() != 0) {
		
		// Read message data into buffers.
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_bass_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_snare_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_conga_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_tom_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_hat_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_hit_data[i];
		}
		for (0 => int i; i < ints_per_drum; i++) {
			e.getInt()
			=> message_ride_data[i];
		}
		e.getInt() - 1
		=> message_voice_index;
		e.getInt()
		=> message_should_loop_flag;
		e.getInt()
		=> message_phrase_length;
		e.getFloat()
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


// Turn into 1D array in future if [x][1] is never used
function void play_drums_message_processor(int bass_data[],
int snare_data[], int conga_data[], int tom_data[],
int hat_data[], int hit_data[], int ride_data[],
int should_loop, int voice, int length,
float beat_alignment){   
	int drum_package[NUM_DRUMS];
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
			=> string address;
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
			
		}
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
