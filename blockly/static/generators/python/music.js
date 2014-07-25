'use strict';

if (!Blockly.Language) Blockly.Language = {};

Blockly.Python = Blockly.Generator.get('Python');

/* Music Blockly Blocks for BlockyTalky.
 * 
 * BlockyTalky dev for Tufts Laboratory for Playful Computaton.
 * blockytalky-dev@elist.tufts.edu
 *
 * Nick Benson
 * nickjbenson@gmail.com
 */
 
 // === Specify Maestro Address ===
// music_specify_maestro_address
// Sets the IP address to use to send messages to the
// maestro (timing) ChucK module.

Blockly.Language.music_specify_maestro_address = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("Specify maestro machine:")
			.appendTitle(new Blockly.FieldTextInput("192.168.1.14"), "maestro_address");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Sets the IP address to use to send messages to the timing module.");
	}
};

// Generator for Specify Maestro Address
// Sets the maestro_IP variable

Blockly.Python.music_specify_maestro_address = function () {
	var text_maestro_address = this.getTitleValue('maestro_address');
	var code = "nickOSC.set_maestro_IP('" + text_maestro_address + "')\n";
	return code;
};

// === Set Tempo ===
// music_set_tempo
// Sets the maestro machine's tempo.

Blockly.Language.music_set_tempo = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("Specify maestro's tempo: ")
			.appendTitle(new Blockly.FieldTextInput("120"), "tempo");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Sets the maestro machine's tempo.");
	}
};

// Generator for Set Tempo
// Sends a bpm message to maestro machine

Blockly.Python.music_set_tempo = function () {
	var text_tempo = this.getTitleValue('tempo');
	var code = "nickOSC.set_tempo(" + text_tempo + ")\n";
	return code;
};

// Removed: Play with is just better, and has smart defaults.
// === Simple Play ===
// music_simple_play
// Takes an input of type "notes" and plays it
// once.
//
//Blockly.Language.music_simple_play = {
//	category: 'Music',
//	helpUrl: '',
//	init: function() {
//		this.setColour(0);
//		this.appendDummyInput("")
//			.appendTitle("play");
//		this.appendValueInput("notes_input")
//			.setCheck("notes");
//		this.setInputsInline(true);
//		this.setPreviousStatement(true);
//		this.setNextStatement(true);
//		this.setTooltip('Plays the note provided once.');
//	}
//};
//
//// Generator for Simple Play
//
//Blockly.Python.music_simple_play = function() {
//	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
//	var code = "";
//	code += "print " + value_notes_input + "\n"; // DEBUG
//	code += "nickOSC.simple_play(" + value_notes_input + ")\n";
//	return code;
//};

// === Simple Note ===
// music_simple_note
// Generate a middle C note one beat long, or
// a simple sequence of notes, for debugging
// and/or quick-start purposes.
//
//Blockly.Language.music_simple_note = {
//	category: 'Music',
//	helpUrl: '',
//	init: function() {
//		this.setColour(0);
//		this.appendDummyInput("")
//			.appendTitle(new Blockly.FieldDropdown([["a note", "a_note"], ["a bunch of notes", "a_bunch_of_notes"]]), "type_of_simple_notes");
//		this.setOutput(true, "notes");
//		this.setTooltip("Creates a middle C note or a simple sequence of notes. For specifying notes, use a Specific Note block, found further down.");
//	}
//};
//
//// Generator for Simple Note
//
//Blockly.Python.music_simple_note = function() {
//	var dropdown_type_of_simple_notes = this.getTitleValue('type_of_simple_notes');
//	var code = "";
//	if (dropdown_type_of_simple_notes == "a_note") {
//		code += "(60, 1)";
//	}
//	else {
//		code += "[(60, 1), (64, 1), (62, 1)]";
//	}
//	return [code, Blockly.Python.ORDER_ATOMIC];
//};

// === Play With Voice ===
// music_play_with
// Plays a note using a specified voice.

Blockly.Language.music_play_with = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("play");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	}
};

// Generator for Play With Voice

Blockly.Python.music_play_with = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	code += "nickOSC.play_with(" + value_notes_input + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === Specific Note ===
// music_note
// Generates a note of specified pitch
// and duration.

Blockly.Language.music_note = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["1/4", "1"], ["1/32", "0.125"], ["1/16", "0.25"], ["1/8", "0.5"], ["1/2", "2"], ["whole", "4"]]), "duration_select")
			.appendTitle("note")
			.appendTitle(new Blockly.FieldTextInput("C4"), "note_text_input");
		this.setInputsInline(true);
		this.setOutput(true, "notes");
		this.setTooltip("Creates a specific note of specified duration.");
	}
};

// Helper function for Specific Note
// converts the argument text, like C#5,
// to a corresponding MIDI note value

var text_to_midi = function(text) {
	// Aiming to match input like C4, D5, E#7, Bb2, etc.
	var note = text[0];
	var octave = text.substring(1);
	var sharpFlatOffset = 0;
	var note_midi_number = 0;
	
	// Sharp or flat
	if (/^[#b]/.test(octave)) {
		// If the test passes then the first
		// character of octave is a # or a b
		if (octave[0] == "#") {
			// sharp, offset is +1
			sharpFlatOffset = 1;
		}
		else {
			// flat, offset is -1
			sharpFlatOffset = -1;
		}
		// Clean the sharp/flat sign out of the
		// octave text storage
		octave = octave.substring(1);
	}
	
	// Notes are a-g or A-G.
	if (/[a-gA-G]/.test(note)) {
		switch (note.toUpperCase()) {
			case "C":
				note_midi_number = 24;
				break;
			case "D":
				note_midi_number = 26;
				break;
			case "E":
				note_midi_number = 28;
				break;
			case "F":
				note_midi_number = 29;
				break;
			case "G":
				note_midi_number = 31;
				break;
			case "A":
				note_midi_number = 33;
				break;
			case "B":
				note_midi_number = 35;
				break;
			default:
				break;
		}
	}
	else {
		console.log("Aborting text-to-midi conversion attempt on " + text + ", invalid note letter.");
		return "-1";
	}
	
	// offset midi note number by octave
	var octave_num = parseInt(octave);
	if (isNaN(octave_num)) {
		// octave couldn't be gotten, abort
		console.log("Couldn't parse octave number of " + text + ", assuming 4.");
		// set to 4 by default
		octave_num = 4
	}
	note_midi_number += (octave_num - 1) * 12;
	
	// Finally, return note_midi_number + the sharp/flat offset
	return note_midi_number + sharpFlatOffset;
	
};

// Generator for Specific Note

Blockly.Python.music_note = function() {
	var text_note_text_input = this.getTitleValue('note_text_input');
	var dropdown_duration_select = this.getTitleValue('duration_select');
	
	// Try to get midi note value from text input
	var midi_note = text_to_midi(text_note_text_input);
	if (midi_note == -1) {
		console.log("Error parsing midi note from specific note block: " + text_note_text_input);
		// We failed, will return rest
	}
	
	var code = "(" + midi_note + ", " + dropdown_duration_select + ")";
	
	return [code, Blockly.Python.ORDER_NONE];
};

// === Rest Note ===
// music_rest
// Generates a rest note of a specified duration.

Blockly.Language.music_rest = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["1/4", "1"], ["1/32", "0.125"], ["1/16", "0.25"], ["1/8", "0.5"], ["1/2", "2"], ["whole", "4"]]), "duration_select")
			.appendTitle(" note rest");
		this.setInputsInline(true);
		this.setOutput(true, "notes");
		this.setTooltip("Generates a rest note of a specified duration.");
	}
};

// Generator for Rest Note

Blockly.Python.music_rest = function() {
	var dropdown_duration_select = this.getTitleValue('duration_select');
	
	var code = "(-1, " + dropdown_duration_select + ")";
	return [code, Blockly.Python.ORDER_NONE];
};

// === Create Phrase ===
// music_create_phrase
// Essentially duplicated from Blockly's create list
// blocks. Creates a list of notes.

Blockly.Language.music_create_phrase = {
  // Create a list with any number of elements of any type.
  category: 'Music',
  helpUrl: '',
  init: function() {
    this.setColour(0);
    this.appendValueInput('ADD0')
        .appendTitle("create a phrase with");
    this.appendValueInput('ADD1');
    this.appendValueInput('ADD2');
    this.appendValueInput('ADD3');
    this.setOutput(true, 'notes');
    this.setMutator(new Blockly.Mutator(['phrase_create_with_item']));
    this.setTooltip("Creates a list of musical notes and/or rests.");
    this.itemCount_ = 4;
  },
  mutationToDom: function(workspace) {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  domToMutation: function(container) {
    for (var x = 0; x < this.itemCount_; x++) {
      this.removeInput('ADD' + x);
    }
    this.itemCount_ = window.parseInt(container.getAttribute('items'), 10);
    for (var x = 0; x < this.itemCount_; x++) {
      var input = this.appendValueInput('ADD' + x);
      if (x == 0) {
        input.appendTitle("create a phrase with");
      }
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendTitle("bluh?");
    }
  },
  decompose: function(workspace) {
    var containerBlock = new Blockly.Block(workspace,
                                           'phrase_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.itemCount_; x++) {
      var itemBlock = new Blockly.Block(workspace, 'phrase_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('ADD' + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.appendValueInput('ADD' + this.itemCount_);
      if (this.itemCount_ == 0) {
        input.appendTitle("create a phrase with");
      }
      // Reconnect any child blocks.
      if (itemBlock.valueConnection_) {
        input.connection.connect(itemBlock.valueConnection_);
      }
      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendTitle("bluh?");
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + x);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Language.phrase_create_with_container = {
  // Container.
  init: function() {
    this.setColour(0);
    this.appendDummyInput()
        .appendTitle("phrase");
    this.appendStatementInput('STACK');
    this.setTooltip("Add or remove note slots to change the length of the phrase.");
    this.contextMenu = false;
  }
};

Blockly.Language.phrase_create_with_item = {
  // Add items.
  init: function() {
    this.setColour(0);
    this.appendDummyInput()
        .appendTitle("note slot");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Add more of these to the phrase container to lengthen the phrase.");
    this.contextMenu = false;
  }
};

// Generator for Create Phrase

Blockly.Python.music_create_phrase = function() {
  // Create a list with any number of elements of any type.
  var code = new Array(this.itemCount_);
  for (var n = 0; n < this.itemCount_; n++) {
    code[n] = Blockly.Python.valueToCode(this, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || "(-1, 0.0)";
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

// === Instruments ===
// music_instrument_block
// Specifies an instrument to use to play 
// notes. NOT IN USE.

//Blockly.Language.music_instrument = {
//	category: 'Music',
//	helpUrl: '',
//	init: function() {
//		this.setColour(0);
//		this.appendDummyInput("")
//			.appendTitle(new Blockly.FieldDropdown([["a flute", "flute"], ["a cool synth", "coolsynth"], ["a kerfuffler", "kerfuffler"], ["an electric drum kit", "electricdrumkit"]]), "instrument_select");
//		this.setInputsInline(true);
//		this.setOutput(true, "instrument");
//		this.setTooltip('');
//	}
//};

// Generator for Music Instrument
// New instruments should be able to be added
// by simply updating the dropdown menu above to
// include that instrument.

//Blockly.Python.music_instrument = function() {
//	var dropdown_instrument_select = this.getTitleValue('instrument_select');
//	var code = dropdown_instrument_select;
//	return [code, Blockly.Python.ORDER_ATOMIC];
//};

// === Set Instrument ===
// music_set_instrument
// Used to specify the instrument to use when playing a given voice.

Blockly.Language.music_set_instrument = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("set")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select")
			.appendTitle("instrument to")
			.appendTitle(new Blockly.FieldDropdown([["bass", "1"], ["bassAlt", "2"], ["classic1", "4"], ["classic2", "5"], ["classic3","6"], ["default", "9"], ["electric", "10"], ["drill", "14"], ["metalworks", "20"], ["organ", "21"], ["perc", "25"], ["piano", "26"], ["rising", "27"], ["cats", "29"], ["synthy", "32"], ["synthy2", "33"], ["synthy3", "35"], ["wahwah", "37"], ["woodwind", "38"]]), "instrument_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Used to specify the instrument to use when playing a given voice.');
	}
};

// Generator for Set Instrument

Blockly.Python.music_set_instrument = function() {
	var dropdown_voice_select = this.getTitleValue('voice_select');
	var dropdown_instrument_select = this.getTitleValue('instrument_select');
	var code = "nickOSC.set_instrument(" + dropdown_voice_select + ", " + dropdown_instrument_select + ")\n";
	return code;
};

// === Drumkit Note ===
// music_drumkit_note
// Used to specify standardized notes by
// name for use with drumkits.
// NOT IN USE.

//Blockly.Language.music_drumkit_note = {
//	category: 'Music',
//	helpUrl: '',
//	init: function() {
//		this.setColour(0);
//		this.appendDummyInput("")
//			.appendTitle(new Blockly.FieldDropdown([["a kick", "a_kick"], ["a hi hat", "a_hi_hat"], ["a tom", "a_tom"]]), "type_of_drumkit_note");
//		this.setOutput(true, "notes");
//		this.setTooltip("Specifies notes by name, for use with drum instruments.");
//	}
//};

// Generator for Drumkit Note

//Blockly.Python.music_drumkit_note = function() {
//	var dropdown_type_of_drumkit_note = this.getTitleValue('type_of_drumkit_note');
//	var code = "...";
//	return [code, Blockly.Python.ORDER_NONE];
//};

// === On Beat Play With Instrument ===
// music_on_beat_play_with
// Plays (once) the specified notes with the specified instrument at the next beat (or specified fraction of a beat).

Blockly.Language.music_on_beat_play_with = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("On the next")
			.appendTitle(new Blockly.FieldDropdown([["beat", "1"], ["1/2 beat", "0.5"], ["1/4 beat", "0.25"], ["1/8 beat", "0.125"], ["two beats", "2"], ["three beats", "3"], ["four beats", "4"]]), "beat_select")
			.appendTitle("play");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Plays (once) the specified notes with the specified instrument at the next beat (or specified fraction of a beat)");
	}
};

// Generator for On Beat Play with Instrument

Blockly.Python.music_on_beat_play_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	code += "nickOSC.on_beat_play_with(" + value_notes_input + ", " + dropdown_beat_select + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === Start Playing With Voice ===
// music_start_playing_with
// Starts playing the specified notes with
// the specified voice over and over.
// Stopped with Stop Playing Voice.

Blockly.Language.music_start_playing_with = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("start looping");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified voice over and over. Stop with the 'stop playing' block.");
	}
};

// Generator for Start Playing With Voice

Blockly.Python.music_start_playing_with = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	code += "nickOSC.start_playing_with(" + value_notes_input + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === Stop Playing Voice ===
// music_stop_playing
// Stops playing anything with the specified voice.

Blockly.Language.music_stop_playing = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("stop playing")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing anything with the specified voice.");
	}
};

// Generator for Stop Playing With Instrument

Blockly.Python.music_stop_playing = function() {
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "nickOSC.stop_playing(" + dropdown_voice_select + ")\n";
	
	return code;
};

// === On Beat Start Playing With Instrument ===
// music_on_beat_start_playing_with
// Starts playing the specified notes with the specified instrument at the next beat (or specified fraction of a beat) over and over until the instrument is stopped.

Blockly.Language.music_on_beat_start_playing_with = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("On the next")
			.appendTitle(new Blockly.FieldDropdown([["beat", "1"], ["1/2 beat", "0.5"], ["1/4 beat", "0.25"], ["1/8 beat", "0.125"], ["two beats", "2"], ["three beats", "3"], ["four beats", "4"]]), "beat_select");
		this.appendDummyInput("")
			.appendTitle("start looping");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified instrument at the next beat (or specified fraction of a beat) over and over until the instrument is stopped.");
	}
};

// Generator for On Beat Start Playing With Instrument

Blockly.Python.music_on_beat_start_playing_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	code += "nickOSC.on_beat_start_playing_with(" + value_notes_input + ", " + dropdown_beat_select + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === On Beat Stop Playing Instrument ===
// music_on_beat_stop_playing
// Stops playing the specified instrument on the next beat
// (or specified fraction of a beat).

Blockly.Language.music_on_beat_stop_playing = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("On the next")
			.appendTitle(new Blockly.FieldDropdown([["beat", "1"], ["1/2 beat", "0.5"], ["1/4 beat", "0.25"], ["1/8 beat", "0.125"], ["two beats", "2"], ["three beats", "3"], ["four beats", "4"]]), "beat_select");
		this.appendDummyInput("")
			.appendTitle("stop playing")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing the specified instrument on the next beat (or specified fraction of a beat).");
	}
};

// Generator for On Beat Stop Playing Instrument

Blockly.Python.music_on_beat_stop_playing = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var dropdown_voice_select = this.getTitleValue('voice_select');
	
	var code = "nickOSC.on_beat_stop_playing(" + dropdown_beat_select + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === Combine Phrase ===
// music_combine_phrase
// Combines two phrases into one.

Blockly.Language.music_combine_phrase = {
  // Create a list with any number of elements of any type.
  category: 'Music',
  helpUrl: '',
  init: function() {
    this.setColour(0);
    this.setOutput(true, 'notes');
    this.appendValueInput('A')
        .setCheck('notes');
    this.appendValueInput('B')
        .setCheck('notes')
        .appendTitle('plus');
    this.setInputsInline(true);
    this.setTooltip("Returns a combined phrase.");
  }
};

// Generator for Combine Phrase

Blockly.Python.music_combine_phrase = function () {
	var value_arg0 = Blockly.Python.valueToCode(this, 'A', Blockly.Python.ORDER_NONE);
	var value_arg1 = Blockly.Python.valueToCode(this, 'B', Blockly.Python.ORDER_NONE);
	var code = "nickOSC.combine_phrase(" + value_arg0 + ", " + value_arg1 + ")\n"
	return [code, Blockly.Python.ORDER_NONE];
};

// === Change Voice ===
// music_change_voice
// Changes whatever the specified voice
// is playing to the new phrase argument.

Blockly.Language.music_change_voice = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("On the next")
			.appendTitle(new Blockly.FieldDropdown([["beat", "1"], ["1/2 beat", "0.5"], ["1/4 beat", "0.25"], ["1/8 beat", "0.125"], ["two beats", "2"], ["three beats", "3"], ["four beats", "4"]]), "beat_select")
			.appendTitle("change")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select")
			.appendTitle("to");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Changes whatever the specified voice is playing to the new phrase argument.");
	}
};

// Generator for Change Voice

Blockly.Python.music_change_voice = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var dropdown_voice_select = this.getTitleValue('voice_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_NONE);
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	code += "nickOSC.change_voice(" + value_notes_input + ", " + dropdown_beat_select + ", " + dropdown_voice_select + ")\n";
	
	return code;
};

// === Set Voice Property ===
// music_set_property
// Sets the specified property of the specified voice
// to the specified value.

Blockly.Language.music_set_property = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("set")
			.appendTitle(new Blockly.FieldDropdown([["volume", "volume"], ["band pass filter", "bandpassfilter"]]), "effect_select")
			.appendTitle("of")
			.appendTitle(new Blockly.FieldDropdown([["voice 1", "1"], ["voice 2", "2"], ["voice 3", "3"], ["voice 4", "4"], ["voice 5", "5"], ["voice 6", "6"], ["voice 7", "7"], ["voice 8", "8"]]), "voice_select")
			.appendTitle("to");
		this.appendValueInput("value_input")
			.setCheck("Number");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Sets the specified property of the specified voice to the specified value between 0 and 100.");
	}
};

// Generator for Set Voice Property

Blockly.Python.music_set_property = function () {
	var dropdown_effect_select = this.getTitleValue('effect_select');
	var dropdown_voice_select = this.getTitleValue('voice_select');
	var value_number_input = Blockly.Python.valueToCode(this, 'value_input', Blockly.Python.ORDER_NONE);
	
	var code = "";
	code += "nickOSC.set_property(" + dropdown_voice_select + ", " + value_number_input + ", '" + dropdown_effect_select + "')\n";
	
	return code;
};

// === Create Drum Sequence ===
// music_drum_sequence
// Returns a phrase containing drum sequence data.

Blockly.Language.music_drum_sequence = {
  category: 'Music',
  helpUrl: '',
  init: function() {
    this.setColour(0);
	this.appendDummyInput("")
		.appendTitle("Create a drum sequence as a phrase");
	this.appendDummyInput("")
        .appendTitle("Bass   ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "bass16");
    this.appendDummyInput("")
        .appendTitle("Snare  ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "snare16");
    this.appendDummyInput("")
        .appendTitle("Conga ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "conga16");
    this.appendDummyInput("")
        .appendTitle("Tom    ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "tom16");
    this.appendDummyInput("")
        .appendTitle("Hat      ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hat16");
    this.appendDummyInput("")
        .appendTitle("Hit       ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "hit16");
    this.appendDummyInput("")
        .appendTitle("Ride    ")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride1")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride2")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride3")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride4")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride5")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride6")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride7")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride8")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride9")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride10")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride11")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride12")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride13")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride14")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride15")
        .appendTitle(new Blockly.FieldCheckbox("FALSE"), "ride16");
    this.setOutput(true, "notes");
    this.setTooltip("Returns a phrase of playable drum sequence data.");
  }
};

var intToDrumkitNoteString = function(i) {
	switch (i) {
		case 1:
			return "bass";
			break;
		case 2:
			return "snare";
			break;
		case 3:
			return "conga";
			break;
		case 4:
			return "tom";
			break;
		case 5:
			return "hat";
			break;
		case 6:
			return "hit";
			break;
		case 7:
			return "ride";
			break;
		default:
			console.log("Bad argument converting int to drumkit string " + i);
			return -1;
	}
};

// Generator for Create Drum Sequence

Blockly.Python.music_drum_sequence = function() {
	
	// Construct list of lists of ones and zeroes
	// corresponding to sequence data.
	var sequence_data = "[";
	for (var i = 1; i < 8; i++) {
		sequence_data = sequence_data.concat("[");
		for (var j = 0; j < 16; j++) {
			var one_or_zero_str = this.getTitleValue(intToDrumkitNoteString(i).concat(String(j+1)))
						== "TRUE" ? "1" : "0";
			sequence_data = sequence_data.concat(one_or_zero_str);
			if (j < 15)
				sequence_data = sequence_data.concat(", ");
		}
		sequence_data = sequence_data.concat("]");
		if (i < 7) {
			sequence_data = sequence_data.concat(", ");
		}
	}
	sequence_data = sequence_data.concat("]");
	
	// Create Python drum sequence object with drum sequence data
	var code = "nickOSC.create_drum_sequence(" + sequence_data + ")";
	
	return [code, Blockly.Python.ORDER_NONE];
};

// === Set Drum Volume ===
// music_drum_volume
// Sets the volume of all drum sounds or individual ones.

Blockly.Language.music_drum_volume = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("set the volume of")
			.appendTitle(new Blockly.FieldDropdown([["all drums", "0"], ["bass", "1"], ["snare", "2"], ["conga", "3"], ["tom", "4"], ["hat", "5"], ["hit", "6"], ["ride", "7"]]), "drum_select")
			.appendTitle("to");
		this.appendValueInput("value_input")
			.setCheck("Number");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Sets the volume of all drum sounds or individual ones to the specified value between 0 and 100.");
	}
};

// Generator for Set Voice Property

Blockly.Python.music_set_property = function () {
	var dropdown_drum_select = this.getTitleValue('drum_select');
	var value_number_input = Blockly.Python.valueToCode(this, 'value_input', Blockly.Python.ORDER_NONE);
	
	// TEST THIS, finish drum volume
	
	var code = "";
	code += "nickOSC.set_property(" + dropdown_drum_select + ", " + value_number_input + "')\n";
	
	return code;
};

// === Dotify Note ===
// music_dotify_note
// Returns a dotted form(s) of the input note or phrase.

Blockly.Language.music_dotify_note = {
  category: 'Music',
  helpUrl: '',
  init: function() {
    this.setColour(0);
	this.appendDummyInput("")
		.appendTitle("dotted");
    this.appendValueInput('input_notes')
        .setCheck('notes');
    this.setInputsInline(true);
    this.setOutput(true, 'notes');
    this.setTooltip("Returns a combined phrase.");
  }
};

// Generator for Dotify Note

Blockly.Python.music_dotify_note = function () {
	var value_input_notes = Blockly.Python.valueToCode(this, 'input_notes', Blockly.Python.ORDER_NONE);
	var code = "nickOSC.dotify_note(" + value_input_notes + ")\n";
	return [code, Blockly.Python.ORDER_NONE];
};

// === Number Note ===
// music_number_note
// Generates a note of specified pitch
// and duration, with pitch specified
// by an input number instead of by a string.

Blockly.Language.music_number_note = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["1/4", "1"], ["1/32", "0.125"], ["1/16", "0.25"], ["1/8", "0.5"], ["1/2", "2"], ["whole", "4"]]), "duration_select")
			.appendTitle("note by number: ");
		this.appendValueInput("midi_note_input")
			.setCheck("Number");
		this.setInputsInline(true);
		this.setOutput(true, "notes");
		this.setTooltip("Creates a specific note of specified duration.");
	}
};

// Generator for Number Note

Blockly.Python.music_number_note = function() {
	var value_midi_note_input = Blockly.Python.valueToCode(this, 'midi_note_input', Blockly.Python.ORDER_NONE);
	var dropdown_duration_select = this.getTitleValue('duration_select');
	
	var code = "(" + value_midi_note_input + ", " + dropdown_duration_select + ")";
	
	return [code, Blockly.Python.ORDER_NONE];
};