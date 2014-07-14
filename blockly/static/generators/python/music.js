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
 
// === Simple Play ===
// music_simple_play
// Takes an input of type "notes" and plays it
// once.

Blockly.Language.music_simple_play = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("play");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Plays the note provided once.');
	}
};

// Generator for Simple Play

Blockly.Python.music_simple_play = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	console.log("Simple play: Got as note input: " + value_notes_input);
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	
	// do some parsing to see if this is one note
	// or multiple notes
	var str = value_notes_input;
	if (str[1] == '(') {
		// one note, wrap with a list
		code += "nickOSC.simple_play([" + str + "])\n";
	}
	else if (str[1] == '[') {
		// multiple notes, send as-is
		code += "nickOSC.simple_play(" + str + ")\n";
	}
	else {
		// variable, send as-is
		code += "nickOSC.simple_play(" + str + ")\n";
	}
	
	return code;
};

// === Simple Note ===
// music_simple_note
// Generate a middle C note one beat long, or
// a simple sequence of notes, for debugging
// and/or quick-start purposes.

Blockly.Language.music_simple_note = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["a note", "a_note"], ["a bunch of notes", "a_bunch_of_notes"]]), "type_of_simple_notes");
		this.setOutput(true, "notes");
		this.setTooltip("Creates a middle C note or a simple sequence of notes. For specifying notes, use a Specific Note block, found further down.");
	}
};

// Generator for Simple Note

Blockly.Python.music_simple_note = function() {
	var dropdown_type_of_simple_notes = this.getTitleValue('type_of_simple_notes');
	var code = "";
	if (dropdown_type_of_simple_notes == "a_note") {
		code += "(60, 1)";
	}
	else {
		code += "[(60, 1), (64, 1), (62, 1)]";
	}
	return [code, Blockly.Python.ORDER_ATOMIC];
};

// === Specific Note ===
// music_specific_note
// Generates a note of specified pitch
// and duration.

Blockly.Language.music_specific_note = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("note")
			.appendTitle(new Blockly.FieldTextInput("C4"), "note_text_input")
			.appendTitle("for")
			.appendTitle(new Blockly.FieldDropdown([["one eighth", "eighth"], ["one quarter", "quarter"], ["one half", "half"], ["one", "one"], ["two", "two"], ["three", "three"], ["four", "four"]]), "duration_select")
			.appendTitle("beats");
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
		console.log("Aborting text-to-midi conversion attempt on " + text + ", couldn't parse octave number.");
		return "-1";
	}
	else {
		note_midi_number += (octave_num - 1) * 12;
	}
	
	// Finally, return note_midi_number + the sharp/flat offset
	return note_midi_number + sharpFlatOffset;
	
};

// Helper function for notes
// converts the argument text, like quarter, half, one, two..
// to a corresponding float value (0.25, 0.5, 1, 2...)
// Supports 1/8, 1/4, 1/2, 1, 2, 3, 4.
// Returns 1 if given an unsupported argument.

var duration_to_float = function(text) {
	var duration = 1;
	
	if (text == "eighth")
		duration = 0.125;
	else if (text == "quarter")
		duration = 0.25;
	else if (text == "half")
		duration = 0.5;
	else if (text == "one")
		duration = 1;
	else if (text == "two")
		duration = 2;
	else if (text == "three")
		duration = 3;
	else if (text == "four")
		duration = 4;
		
	return duration;
};

// Generator for Specific Note

Blockly.Python.music_specific_note = function() {
	var text_note_text_input = this.getTitleValue('note_text_input');
	var dropdown_duration_select = this.getTitleValue('duration_select');
	
	// Try to get midi note value from text input
	var midi_note = text_to_midi(text_note_text_input);
	if (midi_note == -1) {
		console.log("Error parsing midi note from specific note block: " + text_note_text_input);
		// We failed, will return rest
	}
	
	var duration = 1;
	// Determine note duration
	duration = duration_to_float(dropdown_duration_select);
	
	var code = "(" + midi_note + ", " + duration + ")";
	
	return [code, Blockly.Python.ORDER_ATOMIC];
};

// === Simple Rest ===
// music_simple_rest
// Generates a rest note for one beat.

Blockly.Language.music_simple_rest = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("rest for ")
			.appendTitle(new Blockly.FieldDropdown([["one eighth", "eighth"], ["one quarter", "quarter"], ["one half", "half"], ["one", "one"], ["two", "two"], ["three", "three"], ["four", "four"]]), "duration_select")
			.appendTitle("beats");
		this.setInputsInline(true);
		this.setOutput(true, "notes");
		this.setTooltip("Generates a rest note a specified number of beats long.");
	}
};

// Generator for Simple Rest

Blockly.Python.music_simple_rest = function() {
	var dropdown_duration_select = this.getTitleValue('duration_select');
	
	var duration = 1;
	// Determine note duration
	duration = duration_to_float(dropdown_duration_select);
	
	var code = "(-1, " + duration + ")";
	return [code, Blockly.Python.ORDER_ATOMIC];
};

// === Play Block With Instrument ===
// music_play_with
// Plays a note using a specified instrument.

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
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	}
};

// Generator for Play Block With Instrument
// TODO: Method stub

Blockly.Python.music_play_with = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	// do some parsing to see if this is one note
	// or multiple notes
	var str = value_notes_input;
	if (str[1] == '(') {
		// one note, wrap with a list
		code += "nickOSC.play_with([" + str + "], " + value_instrument_input + ")\n";
	}
	else if (str[1] == '[') {
		// multiple notes, send as-is
		code += "nickOSC.play_with(" + str + ", " + value_instrument_input + ")\n";
	}
	else {
		// variable, send as-is
		code += "nickOSC.play_with(" + str + ", " + value_instrument_input + ")\n";
	}
	
	return code;
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

// === Arbitrary Instrument ===
// music_arbitrary_instrument
// Can be used to specify any instrument by name.

Blockly.Language.music_arbitrary_instrument = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldTextInput("flute"), "instrument_name");
		this.setInputsInline(true);
		this.setOutput(true, "instrument");
		this.setTooltip('Can be used to specify any instrument by name.');
	}
};

// Generator for Arbitrary Instrument
// Just returns the name of the instrument as a string

Blockly.Python.music_arbitrary_instrument = function() {
	var text_instrument_name = this.getTitleValue('instrument_name');
	var code = "'" + text_instrument_name + "'";
	return [code, Blockly.Python.ORDER_ATOMIC];
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
// TODO: Method stub

//Blockly.Python.music_drumkit_note = function() {
//	var dropdown_type_of_drumkit_note = this.getTitleValue('type_of_drumkit_note');
//	var code = "...";
//	return [code, Blockly.Python.ORDER_NONE];
//};

// === Start Playing With Instrument ===
// music_start_playing_with
// Starts playing the specified notes with
// the specified instrument over and over.
// Stopped with Stop Playing Instrument.

Blockly.Language.music_start_playing_with = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("start playing");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.appendDummyInput("")
			.appendTitle(", call it")
			.appendTitle(new Blockly.FieldTextInput("loop name"), "loop_name");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified instrument over and over. Stop with the 'stop playing' block.");
	}
};

// Generator for Start Playing With Instrument

Blockly.Python.music_start_playing_with = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var text_loop_name = this.getTitleValue('loop_name');
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	// do some parsing to see if this is one note
	// or multiple notes
	var str = value_notes_input;
	if (str[1] == '(') {
		// one note, wrap with a list
		code += "nickOSC.start_playing_with([" + str + "], " + value_instrument_input + ", " + text_loop_name + ")\n";
	}
	else if (str[1] == '[') {
		// multiple notes, send as-is
		code += "nickOSC.start_playing_with(" + str + ", " + value_instrument_input + ", '" + text_loop_name + "')\n";
	}
	else {
		// variable, send as-is
		code += "nickOSC.start_playing_with(" + str + ", " + value_instrument_input + ", '" + text_loop_name + "')\n";
	}
	
	return code;
};

// === Stop Playing (With Instrument) ===
// music_stop_playing
// Stops playing the loop specified by name.

Blockly.Language.music_stop_playing = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("stop playing")
			.appendTitle(new Blockly.FieldTextInput("loop name"), "loop_name");
		this.setInputsInline(true);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing the loop specified by name.");
	}
};

// Generator for Stop Playing With Instrument

Blockly.Python.music_stop_playing = function() {
	var text_loop_name = this.getTitleValue('loop_name');
	
	var code = "nickOSC.stop_playing('" + text_loop_name + "')\n";
	
	return code;
};

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
			.appendTitle(new Blockly.FieldDropdown([["beat", "beat"], ["1/2 beat", "half_beat"], ["1/4 beat", "quarter_beat"], ["1/8 beat", "eighth_beat"], ["two beats", "two_beats"], ["three beats", "three_beats"], ["four beats", "four_beats"]]), "beat_select");
		this.appendDummyInput("")
			.appendTitle("play");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Plays (once) the specified notes with the specified instrument at the next beat (or specified fraction of a beat)");
	}
};

// Helper function for notes
// converts the argument text, like quarter, half, one, two..
// to a corresponding float value (0.25, 0.5, 1, 2...)
// Supports 1/8, 1/4, 1/2, 1, 2, 3, 4.
// Returns 1 if given an unsupported argument.

var beat_alignment_to_float = function(text) {
	var beat_align = 1;
	
	if (text == "eighth_beat")
		beat_align = 0.125;
	else if (text == "quarter_beat")
		beat_align = 0.25;
	else if (text == "half_beat")
		beat_align = 0.5;
	else if (text == "beat")
		beat_align = 1;
	else if (text == "two_beats")
		beat_align = 2;
	else if (text == "three_beats")
		beat_align = 3;
	else if (text == "four_beats")
		beat_align = 4;
		
	return beat_align;
};

// Generator for On Beat Play with Instrument

Blockly.Python.music_on_beat_play_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	
	var beat_align = beat_alignment_to_float(dropdown_beat_select);
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	// do some parsing to see if this is one note
	// or multiple notes
	var str = value_notes_input;
	if (str[1] == '(') {
		// one note, wrap with a list
		code += "nickOSC.on_beat_play_with([" + str + "], " + beat_align + ", " + value_instrument_input + ")\n";
	}
	else if (str[1] == '[') {
		// multiple notes, send as-is
		code += "nickOSC.on_beat_play_with(" + str + ", " + beat_align + ", " + value_instrument_input + ")\n";
	}
	else {
		// variable, send as-is
		code += "nickOSC.on_beat_play_with(" + str + ", " + beat_align + ", " + value_instrument_input + ")\n";
	}
	
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
			.appendTitle(new Blockly.FieldDropdown([["beat", "beat"], ["1/2 beat", "half_beat"], ["1/4 beat", "quarter_beat"], ["1/8 beat", "eighth_beat"]]), "beat_select");
		this.appendDummyInput("")
			.appendTitle("start playing")
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDummyInput("")
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.appendDummyInput("")
			.appendTitle(", call it")
			.appendTitle(new Blockly.FieldTextInput("loop name"), "loop_name");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified instrument at the next beat (or specified fraction of a beat) over and over until the instrument is stopped.");
	}
};

// Generator for On Beat Start Playing With Instrument

Blockly.Python.music_on_beat_start_playing_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var text_loop_name = this.getTitleValue('loop_name');
	
	var beat_align = beat_alignment_to_float(dropdown_beat_select);
	
	var code = "";
	code += "print " + value_notes_input + "\n"; // DEBUG
	// do some parsing to see if this is one note
	// or multiple notes
	var str = value_notes_input;
	if (str[1] == '(') {
		// one note, wrap with a list
		code += "nickOSC.on_beat_start_playing_with([" + str + "], " + beat_align + ", " + value_instrument_input + ", " + text_loop_name + ")\n";
	}
	else if (str[1] == '[') {
		// multiple notes, send as-is
		code += "nickOSC.on_beat_start_playing_with(" + str + ", " + beat_align + ", " + value_instrument_input + ", " + "'" + text_loop_name + "')\n";
	}
	else {
		// variable, send as-is
		code += "nickOSC.on_beat_start_playing_with(" + str + ", " + beat_align + ", " + value_instrument_input + ", " + "'" + text_loop_name + "')\n";
	}
	
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
			.appendTitle(new Blockly.FieldDropdown([["beat", "beat"], ["1/2 beat", "half_beat"], ["1/4 beat", "quarter_beat"], ["1/8 beat", "eighth_beat"]]), "beat_select");
		this.appendDummyInput("")
			.appendTitle("stop playing")
			.appendTitle(new Blockly.FieldTextInput("loop name"), "loop_name");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing the specified instrument on the next beat (or specified fraction of a beat).");
	}
};

// Generator for On Beat Stop Playing Instrument
// TODO: Method stub

Blockly.Python.music_on_beat_stop_playing = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var text_loop_name = this.getTitleValue('loop_name');
	
	var beat_align = beat_alignment_to_float(dropdown_beat_select);
	
	var code = "nickOSC.on_beat_stop_playing(" + beat_align + ", '" + text_loop_name + "')\n";
	
	return code;
};

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

// Generator for Specify Maestro Address
// Sends a bpm message to maestro machine

Blockly.Python.music_set_tempo = function () {
	var text_tempo = this.getTitleValue('tempo');
	var code = "nickOSC.set_tempo(" + text_tempo + ")\n";
	return code;
};

// === Combine Phrase ===
// music_combine_phrase
// Pssst. Secretly this is just a + operator
// (that returns concatenated notes)

Blockly.Language.music_combine_phrase = {
  // Create a list with any number of elements of any type.
  category: 'Music',
  helpUrl: '',
  init: function() {
    this.setColour(0);
    this.setOutput(true, 'notes');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendTitle('plus');
    this.setInputsInline(true);
    this.setTooltip("Returns a combined phrase.");
  }
};

// Generator for Combine Phrase

Blockly.Python.music_combine_phrase = function () {
	var argument0 = Blockly.Python.valueToCode(this, 'A', order) || '[]';
	var argument1 = Blockly.Python.valueToCode(this, 'B', order) || '[]';
	code = argument0 + " + " + argument1;
	return [code, Blockly.Python.ORDER_ATOMIC];
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
    this.setOutput(true, 'notes');
    this.setMutator(new Blockly.Mutator(['phrase_create_with_item']));
    this.setTooltip("Creates a list of musical notes and/or rests.");
    this.itemCount_ = 3;
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
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};