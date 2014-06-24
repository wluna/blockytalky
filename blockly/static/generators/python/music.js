'use strict';

if (!Blockly.Language) Blockly.Language = {};

Blockly.Python = Blockly.Generator.get('Python');

/* Music Blockly Blocks for BlockyTalky.
 * These blocks won't work without 
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
// TODO: Method stub

Blockly.Python.music_simple_play = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var code = '...';
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
// TODO: Method stub

Blockly.Python.music_simple_note = function() {
	var dropdown_type_of_simple_notes = this.getTitleValue('type_of_simple_notes');
	var code = '...';
	return [code, Blockly.Python.ORDER_NONE];
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
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltop("Creates a rest note one beat long.");
	}
};

// Generator for Specific Note
// TODO: Method stub

Blockly.Python.music_specific_note = function() {
	var text_note_text_input = this.getTitleValue('note_text_input');
	var dropdown_duration_select = this.getTitleValue('duration_select');
	var code = '...';
	return code;
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
			.appendTitle("a rest")
		this.setInputsInline(true);
		this.setOutput(true, "notes");
		this.setTooltip("Generates a rest note one beat long.");
	}
};

// Generator for Simple Rest
// TODO: Method stub

Blockly.Python.music_simple_rest = function() {
	var code = '...';
	return [code, Blockly.Python.ORDER_NONE];
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
	var code = '...';
	return code;
};

// === Instruments ===
// music_instrument_block
// Specifies an instrument to use to play 
// notes.

Blockly.Language.music_instrument = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["a flute", "flute"], ["a cool synth", "coolsynth"], ["a kerfuffler", "kerfuffler"], ["an electric drum kit", "electricdrumkit"]]), "instrument_select");
		this.setInputsInline(true);
		this.setOutput(true, "instrument");
		this.setTooltip('');
	}
};

// Generator for Music Instrument
// TODO: Method stub

Blockly.Python.music_instrument = function() {
	var dropdown_instrument_select = this.getTitleValue('instrument_select');
	var code = '...';
	return [code, Blockly.Python.ORDER_NONE];
};

// === Drumkit Note ===
// music_drumkit_note
// Used to specify standardized notes by
// name for use with drumkits.

Blockly.Language.music_drumkit_note = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle(new Blockly.FieldDropdown([["a kick", "a_kick"], ["a hi hat", "a_hi_hat"], ["a tom", "a_tom"]]), "type_of_drumkit_note");
		this.setOutput(true, "notes");
		this.setTooltip("Specifies notes by name, for use with drum instruments.");
	}
};

// Generator for Drumkit Note
// TODO: Method stub

Blockly.Python.music_drumkit_note = function() {
	var dropdown_type_of_drumkit_note = this.getTitleValue('type_of_drumkit_note');
	var code = "...";
	return [code, Blockly.Python.ORDER_NONE];
};

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
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified instrument over and over. Stop with the 'stop playing' block.");
	}
};

// Generator for Start Playing With Instrument
// TODO: Method stub

Blockly.Python.music_start_playing_with = function() {
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var code = "...";
	return code;
};

// === Stop Playing (With Instrument) ===
// music_stop_playing
// Stops playing anything with the specified
// instrument.

Blockly.Language.music_stop_playing = {
	category: 'Music',
	helpUrl: '',
	init: function() {
		this.setColour(0);
		this.appendDummyInput("")
			.appendTitle("stop playing");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing anything with the specified instrument.");
	}
};

// Generator for Stop Playing With Instrument
// TODO: Method stub

Blockly.Python.music_stop_playing = function() {
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var code = "...";
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
			.appendTitle(new Blockly.FieldDropdown([["beat", "beat"], ["1/2 beat", "half_beat"], ["1/4 beat", "quarter_beat"], ["1/8 beat", "eighth_beat"]]), "beat_select");
		this.appendDummyInput("")
			.appendField("play");
		this.appendValueInput("notes_input")
			.setCheck("notes");
		this.appendDumyInput()
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Plays (once) the specified notes with the specified instrument at the next beat (or specified fraction of a beat)");
	}
};

// Generator for On Beat Play with Instrument
// TODO: Method stub

Blockly.Python.music_on_beat_play_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var code = "...";
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
		this.appendDummyInput()
			.appendTitle("with");
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Starts playing the specified notes with the specified instrument at the next beat (or specified fraction of a beat) over and over until the instrument is stopped.");
	}
};

// Generator for On Beat Start Playing With Instrument
// TODO: Method stub

Blockly.Python.music_on_beat_start_playing_with = function () {
	var dropdown_beat_select = this.getTitleValue('beat_select');
	var value_notes_input = Blockly.Python.valueToCode(this, 'notes_input', Blockly.Python.ORDER_ATOMIC);
	var value_instrument_input = Blockly.Python.valueToCode(this, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var code = "...";
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
		this.appendValueInput("instrument_input")
			.setCheck("instrument");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Stops playing the specified instrument on the next beat (or specified fraction of a beat).");
	}
};

// Generator for On Beat Stop Playing Instrument
// TODO: Method stub

Blockly.Python.music_on_beat_stop_playing = function () {
	var dropdown_beat_select = block.getFieldValue('beat_select');
	var value_instrument_input = Blockly.Python.valueToCode(block, 'instrument_input', Blockly.Python.ORDER_ATOMIC);
	var code = "...";
	return code;
};