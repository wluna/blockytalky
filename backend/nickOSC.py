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
		message.append(-1)
		message.append(0.)
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
			
# Sends some notes to be played with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_play_with(notes, beat_fraction, voice):
	address = "/lpc/maestro/play_on_beat_with"
	try:
		if (notes.is_drums):  # drum sequence
			# bass drum notes
			message = construct_basic_phrase_message(notes, address)
			message.append(float(beat_fraction))
			message.append(int(voice))
			# snare drum notes
			message2 = construct_basic_phrase_message(notes.snare, address)
			message2.append(float(beat_fraction))
			message2.append(int(voice))
			# conga drum notes
			message3 = construct_basic_phrase_message(notes.conga, address)
			message3.append(float(beat_fraction))
			message3.append(int(voice))
			# tom drum notes
			message4 = construct_basic_phrase_message(notes.tom, address)
			message4.append(float(beat_fraction))
			message4.append(int(voice))
			# hat drum notes
			message5 = construct_basic_phrase_message(notes.hat, address)
			message5.append(float(beat_fraction))
			message5.append(int(voice))
			# hit drum notes
			message6 = construct_basic_phrase_message(notes.hit, address)
			message6.append(float(beat_fraction))
			message6.append(int(voice))
			# ride drum notes
			message7 = construct_basic_phrase_message(notes.ride, address)
			message7.append(float(beat_fraction))
			message7.append(int(voice))
			# send all those messages
			send_message_to_maestro(message, address)
			send_message_to_maestro(message2, address)
			send_message_to_maestro(message3, address)
			send_message_to_maestro(message4, address)
			send_message_to_maestro(message5, address)
			send_message_to_maestro(message6, address)
			send_message_to_maestro(message7, address)
	except NameError:  # normal notes
		message = construct_basic_phrase_message(notes, address)
		message.append(float(beat_fraction))
		message.append(int(voice))
		send_message_to_maestro(message, address)
	
	
# Sends some notes to be looped with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_start_playing_with(notes, beat_fraction, voice):
	# print "at on_beat_start_playing_with"
	address = "/lpc/maestro/loop_on_beat_with"
	try:
		if (notes.is_drums):  # drum sequence
			# bass drum notes
			message = construct_basic_phrase_message(notes, address)
			message.append(float(beat_fraction))
			message.append(int(voice))
			send_message_to_maestro(message, address)
			# snare drum notes
			message2 = construct_basic_phrase_message(notes.snare, address)
			message2.append(float(beat_fraction))
			message2.append(int(voice))
			send_message_to_maestro(message2, address)
			# conga drum notes
			message3 = construct_basic_phrase_message(notes.conga, address)
			message3.append(float(beat_fraction))
			message3.append(int(voice))
			send_message_to_maestro(message3, address)
			# tom drum notes
			message4 = construct_basic_phrase_message(notes.tom, address)
			message4.append(float(beat_fraction))
			message4.append(int(voice))
			send_message_to_maestro(message4, address)
			# hat drum notes
			message5 = construct_basic_phrase_message(notes.hat, address)
			message5.append(float(beat_fraction))
			message5.append(int(voice))
			send_message_to_maestro(message5, address)
			# hit drum notes
			message6 = construct_basic_phrase_message(notes.hit, address)
			message6.append(float(beat_fraction))
			message6.append(int(voice))
			send_message_to_maestro(message6, address)
			# ride drum notes
			message7 = construct_basic_phrase_message(notes.ride, address)
			message7.append(float(beat_fraction))
			message7.append(int(voice))
			send_message_to_maestro(message7, address)
	except NameError:  # normal notes
		message = construct_basic_phrase_message(notes, address)
		message.append(float(beat_fraction))
		message.append(int(voice))
		send_message_to_maestro(message, address)
	
# Stops playing any notes with the specified loop name
# on a certain beat (or fraction thereof).
def on_beat_stop_playing(beat_fraction, voice):
	# print "at on_beat_stop_playing"
	address = "/lpc/maestro/stop_playing_on_beat"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(float(beat_fraction))
	message.append(int(voice))
	send_message_to_maestro(message, address)
	
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
	address = "/lpc/maestro/instrument"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(voice))
	message.append(int(instrument))
	send_message_to_maestro(message, address)

def set_property(voice, percentage, property):
	# print "at set_property"
	address = "/lpc/maestro/" + str(property)
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(int(voice))
	message.append(float(percentage))
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
		sixteen_rests.append((-1, 0.25))
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
		except NameError:
			print "Error combining drum sequence, maybe they're not both drums?"
			return [(-1, 0.25)]
	return notes1 + notes2
	
# Changes a voice to play a different set of notes
def change_voice(notes, beat_fraction, voice):
	# print "at change_voice"
	address = "/lpc/maestro/change_voice"
	try:
		if (notes.is_drums):  # drum sequence
			drum_address = "/lpc/maestro/change_voice_drums"
			# bass drum notes
			message = construct_basic_phrase_message(notes, drum_address)
			message.append(float(beat_fraction))
			message.append(int(voice))
			send_message_to_maestro(message, drum_address)
			# snare drum notes
			message2 = construct_basic_phrase_message(notes.snare, drum_address)
			message2.append(float(beat_fraction))
			message2.append(int(voice))
			send_message_to_maestro(message2, drum_address)
			# conga drum notes
			message3 = construct_basic_phrase_message(notes.conga, drum_address)
			message3.append(float(beat_fraction))
			message3.append(int(voice))
			send_message_to_maestro(message3, drum_address)
			# tom drum notes
			message4 = construct_basic_phrase_message(notes.tom, drum_address)
			message4.append(float(beat_fraction))
			message4.append(int(voice))
			send_message_to_maestro(message4, drum_address)
			# hat drum notes
			message5 = construct_basic_phrase_message(notes.hat, drum_address)
			message5.append(float(beat_fraction))
			message5.append(int(voice))
			send_message_to_maestro(message5, drum_address)
			# hit drum notes
			message6 = construct_basic_phrase_message(notes.hit, drum_address)
			message6.append(float(beat_fraction))
			message6.append(int(voice))
			send_message_to_maestro(message6, drum_address)
			# ride drum notes
			message7 = construct_basic_phrase_message(notes.ride, drum_address)
			message7.append(float(beat_fraction))
			message7.append(int(voice))
			send_message_to_maestro(message7, drum_address)
	except NameError:  # normal notes
		message = construct_basic_phrase_message(notes, address)
		message.append(float(beat_fraction))
		message.append(int(voice))
		send_message_to_maestro(message, address)
	
# Returns a note or list of notes with their duration(s) x 1.5
# or None if there's an error
def dotify_note(notes):
	if (isinstance(notes, tuple)):
		return (notes[0], notes[1]*1.5)
	elif (isinstance(notes, list)):
		return [(x[0], x[1]*1.5) for x in notes]
	else:
		return None