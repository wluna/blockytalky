OscSend OSC_sender;
OSC_sender.setHost("localhost",1111);


"/lpc/maestro/drums/play, iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiiiiiii"
                               + "iiif"
=> string address;

OSC_sender.startMsg(address);

for (0 => int i; i < 56; i++) {
	OSC_sender.addInt(255);
}

OSC_sender.addInt(1);
OSC_sender.addInt(1);
OSC_sender.addInt(16);
OSC_sender.addFloat(3.0);