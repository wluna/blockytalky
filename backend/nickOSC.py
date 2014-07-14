import OSC

# nickOSC.py
# Contains a number of methods to make it easier
# to send OSC messages from blocks, especially for
# interfacing with the 'maestro.ck' chuck module
# running at the note_destination_hostname.

# hostname and port
note_destination_hostname = "192.168.1.14"
note_destination_port = 1111

# OSC client used by various methods to send messages
osc_client = OSC.OSCClient()

# Setting note_destination_hostname
def set_maestro_IP(maestro_IP_string):
	global note_destination_hostname
	note_destination_hostname = maestro_IP_string
	print "Destination hostname set to " + str(maestro_IP_string)

# Constructs a pyOSC OSCMessage object with an argument
# list of notes (pitch, duration tuples) and an argument
# address, padded. Methods can append more information onto the
# message as needed.
def construct_basic_phrase_message(notes, address):
	message = OSC.OSCMessage()
	message.setAddress(address)
	# copy note content into message
	for i in range(len(notes)):
		message.append(int(notes[i][0]))
		message.append(float(notes[i][1]))
	# pad message with empty notes
	# (phrases require 64 notes sent)
	for i in range(64 - len(notes)):
		message.append(-1)
		message.append(0.)
	return message

# Because who likes code duplication?
def send_message_to_maestro(message, address):
	try:
		osc_client.sendto(message, (note_destination_hostname, note_destination_port))
		print "message sent to " + note_destination_hostname + " at " + address
	except OSC.OSCClientError as e:
		print "Error while sending: " + str(e)
		print "Trying again."
		try:
			osc_client.sendto(message, (note_destination_hostname, note_destination_port))
			print "Sent the second time around"
		except OSC.OSCClientError as e:
			print "Nope the message failed to send again. :(" + str(e)

# Sends some notes to be played immediately.
def simple_play(notes):
	address = "/lpc/maestro/play"
	message = construct_basic_phrase_message(notes, address)
	send_message_to_maestro(message, address)
			
# Sends some notes to be played with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_play_with(notes, beat_fraction, instrument):
	address = "/lpc/maestro/play_on_beat_with"
	message = construct_basic_phrase_message(notes, address)
	# append beat fraction
	message.append(float(beat_fraction))
	# append instrument name
	message.append(str(instrument))
	send_message_to_maestro(message, address)
	
# Sends some notes to be looped with a certain instrument
# on a certain beat (or fraction thereof).
def on_beat_start_playing_with(notes, beat_fraction, instrument, loop_name):
	address = "/lpc/maestro/loop_on_beat_with"
	message = construct_basic_phrase_message(notes, address)
	message.append(float(beat_fraction))
	message.append(str(instrument))
	message.append(str(loop_name))
	send_message_to_maestro(message, address)
	
# Stops playing any notes with the specified loop name
# on a certain beat (or fraction thereof).
def on_beat_stop_playing(beat_fraction, loop_name):
	address = "/lpc/maestro/stop_playing_on_beat"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(float(beat_fraction))
	message.append(str(loop_name))
	send_message_to_maestro(message, address)
	
def play_with(notes, instrument):
	on_beat_play_with(notes, 0., instrument)

# Starts looping a phrase immediately in the specified loop
def start_playing_with(notes, instrument, loop_name):
	on_beat_start_playing_with(notes, 0., instrument, loop_name)

# Stops playing any notes in the specified loop
def stop_playing(loop_name):
	on_beat_stop_playing(0., loop_name)

# Sets the tempo of the maestro module by sending a
# tempo message
def set_tempo(bpm):
	address = "/lpc/maestro/tempo"
	message = OSC.OSCMessage()
	message.setAddress(address)
	message.append(float(bpm))
	send_message_to_maestro(message, address)