import OSC

"""nickOSC.py
Contains a number of methods to make it easier
to send OSC messages from blocks, especially for
interfacing with the 'maestro.ck' chuck module
running at the note_destination_hostname."""

# hostname and port
note_destination_hostname = "192.168.1.14"
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
		# print "message sent to " + note_destination_hostname + " at " + address
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
	message = construct_basic_phrase_message(notes, address)
	# append beat fraction
	message.append(float(beat_fraction))
	# append voice number
	message.append(int(voice))
	send_message_to_maestro(message, address)
	
# Sends some notes to be looped with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_start_playing_with(notes, beat_fraction, voice):
	# print "at on_beat_start_playing_with"
	address = "/lpc/maestro/loop_on_beat_with"
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
	
# combines two phrases into one
def combine_phrase(notes1, notes2):
	if (isinstance(notes1, tuple)):
		notes1 = [notes1]
	if (isinstance(notes2, tuple)):
		notes2 = [notes2]
	return notes1 + notes2
	
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
	
# Changes a voice to play a different set of notes
def change_voice(notes, beat_fraction, voice):
	# print "at change_voice"
	address = "/lpc/maestro/change_voice"
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