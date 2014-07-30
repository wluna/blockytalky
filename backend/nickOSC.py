import OSC

"""nickOSC.py
Contains a number of methods to make it easier
to send OSC messages from blocks, especially for
interfacing with the 'maestro.ck' chuck module
running at the note_destination_hostname."""

# hostname and port
note_destination_hostname = ""
note_destination_port = 1111

# OSC client used by various methods to send messages
osc_client = OSC.OSCClient()

# Setting note_destination_hostname
def set_maestro_IP(maestro_IP_string):
	global note_destination_hostname
	note_destination_hostname = maestro_IP_string
	# print "Destination hostname set to " + str(maestro_IP_string)

# Constructs a pyOSC OSCMessage object with an argument
# list of notes (pitch, duration tuples) and an argument
# address, padded. Methods can append more information onto the
# message as needed.
def construct_basic_phrase_message(notes, address):
	# print "constructing phrase from: " + str(notes)
	message = OSC.OSCMessage()
	message.setAddress(address)
	# copy note content into message
	if (isinstance(notes, tuple)):
		notes = [notes]
	for note in notes:
		message.append(int(note[0]))
		message.append(float(note[1]))
	# pad message with empty notes
	# (phrases require 256 notes sent)
	for i in range(128 - len(notes)):
		message.append(int(0))
		message.append(float(0.))
	return message

# Because who likes code duplication?
def send_message_to_maestro(message, address):
	try:
		osc_client.sendto(message, (note_destination_hostname, note_destination_port))
		# print "message sent to " + note_destination_hostname + " at " + address + ", content " + str(message)
	except OSC.OSCClientError as e:
		print "Error while sending: " + str(e)
		print "Trying again."
		try:
			osc_client.sendto(message, (note_destination_hostname, note_destination_port))
			print "Sent the second time around"
		except OSC.OSCClientError as e:
			print "Nope the message failed to send again. :(" + str(e)
			
def play_voice_message(notes, voice, should_loop, beat_align):
	address = "/lpc/maestro/voice/play"
	message = construct_basic_phrase_message(notes, address)
	message.append(int(voice))
	message.append(int(should_loop))
	message.append(float(beat_align))
	send_message_to_maestro(message, address)
	
def stop_message(voice, beat_align):
	address = "/lpc/maestro/stop"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(voice))
	message.append(float(beat_align))
	send_message_to_maestro(message, address)
	
def convert_drum_sequence_to_integers(sequence, num_ints):
	drum_ints = [0 for x in range(num_ints)]
	drum_ints_index = 0
	bitstring = ""
	for i in range(len(drum_sequence)):
		trigger = drum_sequence[i][0] != 0
		bitstring = ("1" if trigger else "0") + bitstring
		if (i % 32 == 0):
			drum_ints[drum_ints_index] = eval(
					"0b" + bitstring
					)
			bitstring = ""
			drum_ints_index += 1
			if (drum_ints_index == max_num_ints):
				break
	if (bitstring != "") and (drum_ints_index != max_num_ints):
		# Deal with leftover 16 bit-characters.
		drum_ints[drum_ints_index] = eval(
				"0b0000000000000000" + bitstring
				)
	return drum_ints
	
def play_drums_message(drum_sequence, voice, should_loop, beat_align):
	# Parse drum sequence data.
	phrase_length = len(drum_sequence) / 16
	
	bass_ints = convert_drum_sequence_to_integers(
			drum_sequence, 8)
	snare_ints = convert_drum_sequence_to_integers(
			drum_sequence.snare, 8)
	conga_ints = convert_drum_sequence_to_integers(
			drum_sequence.conga, 8)
	tom_ints = convert_drum_sequence_to_integers(
			drum_sequence.tom, 8)
	hat_ints = convert_drum_sequence_to_integers(
			drum_sequence.hat, 8)
	hit_ints = convert_drum_sequence_to_integers(
			drum_sequence.hit, 8)
	ride_ints = convert_drum_sequence_to_integers(
			drum_sequence.ride, 8)
	
	# Send the message.
	address = "/lpc/maestro/drums/play"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(bass_ints)
	message.append(snare_ints)
	message.append(conga_ints)
	message.append(tom_ints)
	message.append(hat_ints)
	message.append(hit_ints)
	message.append(ride_ints)
	message.append(int(voice))
	message.append(int(should_loop))
	message.append(int(phrase_length))
	message.append(float(beat_align))
	send_message_to_maestro(message, address)
			
# Sends some notes to be played with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_play_with(notes, beat_align, voice):
	if (notes.is_drums):
		play_drums_message(notes, voice, 0, beat_align)
	except AttributeError:
		play_voice_message(notes, voice, 0, beat_align)
	
# Sends some notes to be looped with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_start_playing_with(notes, beat_align, voice):
	if (notes.is_drums):
		play_drums_message(notes, voice, 1, beat_align)
	except AttributeError:
		play_voice_message(notes, voice, 1, beat_align)
	
# Stops playing any notes with the specified loop name
# on a certain beat (or fraction thereof).
def on_beat_stop_playing(beat_align, voice):
	stop_message(voice, beat_align)
	
def play_with(notes, voice):
	on_beat_play_with(notes, 0., voice)

# Starts looping a phrase immediately in the specified loop
def start_playing_with(notes, voice):
	# print "at start_playing_with"
	on_beat_start_playing_with(notes, 0., voice)

# Stops playing any notes in the specified loop
def stop_playing(voice):
	# print "at stop_playing"
	on_beat_stop_playing(0., voice)

# Sets the tempo of the maestro module
def set_tempo(bpm):
	address = "/lpc/maestro/tempo"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(float(bpm))
	send_message_to_maestro(message, address)
	
# Set the instrument to use with a given voice
def set_instrument(voice, instrument):
	# print "at set_instrument"
	address = "/lpc/maestro/voice/instrument"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(voice))
	message.append(int(instrument))
	send_message_to_maestro(message, address)

def set_property(voice, percentage, property):
	# print "at set_property"
	address = "/lpc/maestro/voice/" + str(property)
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(voice))
	message.append(int(percentage))
	send_message_to_maestro(message, address)
	
def set_drum_volume(drum, percentage):
	address = "/lpc/maestro/drum_volume"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(drum))
	message.append(float(percentage))
	send_message_to_maestro(message, address)

class DrumSequence(list):
	pass
	
def create_drum_sequence(sequence_data):

	# initialize sequence
	sixteen_rests = []
	for i in range(16):
		sixteen_rests.append((0, 0.25))
	sequence = DrumSequence(sixteen_rests)
	sequence.is_drums = True
	sequence.snare = list(sixteen_rests)
	sequence.conga = list(sixteen_rests)
	sequence.tom = list(sixteen_rests)
	sequence.hat = list(sixteen_rests)
	sequence.hit = list(sixteen_rests)
	sequence.ride = list(sixteen_rests)
	
	# attempt to populate sequence with sequence_data
	# bass
	for i in range(16):
		if sequence_data[0][i] == 1:
			sequence[i] = (-10, 0.25)
			
	# snare
	for i in range(16):
		if sequence_data[1][i] == 1:
			sequence.snare[i] = (-11, 0.25)
	
	# conga
	for i in range(16):
		if sequence_data[2][i] == 1:
			sequence.conga[i] = (-12, 0.25)
	
	# tom
	for i in range(16):
		if sequence_data[3][i] == 1:
			sequence.tom[i] = (-13, 0.25)
	
	# hat
	for i in range(16):
		if sequence_data[4][i] == 1:
			sequence.hat[i] = (-14, 0.25)
	
	# hit
	for i in range(16):
		if sequence_data[5][i] == 1:
			sequence.hit[i] = (-15, 0.25)
	
	# ride
	for i in range(16):
		if sequence_data[6][i] == 1:
			sequence.ride[i] = (-16, 0.25)
	
	return sequence
	
# combines two phrases into one
def combine_phrase(notes1, notes2):
	if (isinstance(notes1, tuple)):
		notes1 = [notes1]
	if (isinstance(notes2, tuple)):
		notes2 = [notes2]
	if (isinstance(notes1, DrumSequence)):
		# both MUST be drum sequences
		try:
			newDrumSequence = DrumSequence(notes1)
			for i in range(len(notes2)):
				newDrumSequence.append(notes2[i])
			newDrumSequence.is_drums = True
			newDrumSequence.snare = list(notes1.snare)
			for i in range(len(notes2.snare)):
				newDrumSequence.snare.append(notes2.snare[i])
			newDrumSequence.conga = list(notes1.conga)
			for i in range(len(notes2.conga)):
				newDrumSequence.conga.append(notes2.conga[i])
			newDrumSequence.tom = list(notes1.tom)
			for i in range(len(notes2.tom)):
				newDrumSequence.tom.append(notes2.tom[i])
			newDrumSequence.hat = list(notes1.hat)
			for i in range(len(notes2.hat)):
				newDrumSequence.hat.append(notes2.hat[i])
			newDrumSequence.hit = list(notes1.hit)
			for i in range(len(notes2.hit)):
				newDrumSequence.hit.append(notes2.hit[i])
			newDrumSequence.ride = list(notes1.ride)
			for i in range(len(notes2.ride)):
				newDrumSequence.ride.append(notes2.ride[i])
			return newDrumSequence
		except AttributeError:
			print "Error combining drum sequence, maybe they're not both drums?"
			return [(-1, 0.0)]
	return notes1 + notes2
	
# Returns a note or list of notes with their duration(s) x 1.5
# or None if there's an error
def dotify_note(notes):
	if (isinstance(notes, tuple)):
		return (notes[0], notes[1]*1.5)
	elif (isinstance(notes, list)):
		return [(x[0], x[1]*1.5) for x in notes]
	else:
		return None