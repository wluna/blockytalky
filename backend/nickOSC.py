import OSC

# nickOSC.py
# Contains a few methods to make it easier
# to send OSC messages from blocks.

note_destination_hostname = "192.168.1.14"
note_destination_port = 1111

osc_client = OSC.OSCClient()

def set_maestro_IP(maestro_IP_string):
	global note_destination_hostname
	note_destination_hostname = maestro_IP_string
	print "Destination hostname set to " + str(maestro_IP_string)

def simple_play(notes):
	message = OSC.OSCMessage()
	message.setAddress("/lpc/maestro/play")
	# copy note content into message
	for i in range(len(notes)):
		message.append(int(notes[i][0]))
		message.append(float(notes[i][1]))
	# pad message with empty notes
	# (phrases require 64 notes sent)
	for i in range(64 - len(notes)):
		message.append(-1)
		message.append(0.)
	try:
		osc_client.sendto(message, (note_destination_hostname, note_destination_port))
		print "message sent to " + note_destination_hostname + " from simple_play"
	except OSC.OSCClientError as e:
		print "Error while sending: " + str(e)
		print "Trying again."
		try:
			osc_client.sendto(message, (note_destination_hostname, note_destination_port))
			print "Sent the second time around"
		except OSC.OSCClientError as e:
			print "Nope the message failed to send again. :(" + str(e)
			
def on_beat_play_with(notes, beat_fraction):
	message = OSC.OSCMessage()
	message.setAddress("/lpc/maestro/play_on_beat")
	# copy note content into message
	for i in range(len(notes)):
		message.append(int(notes[i][0]))
		message.append(float(notes[i][1]))
	# pad message with empty notes
	# (phrases require 64 notes sent)
	for i in range(64 - len(notes)):
		message.append(-1)
		message.append(0.)
	# append beat alignment fraction
	message.append(float(beat_fraction))
	try:
		osc_client.sendto(message, (note_destination_hostname, note_destination_port))
		print "message sent to " + note_destination_hostname + " from on_beat_play_with"
	except OSC.OSCClientError as e:
		print "Error while sending: " + str(e)
		print "Trying again."
		try:
			osc_client.sendto(message, (note_destination_hostname, note_destination_port))
			print "Sent the second time around"
		except OSC.OSCClientError as e:
			print "Nope the message failed to send again. :(" + str(e)