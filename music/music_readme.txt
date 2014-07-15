Making Music with BlockyTalky
=============================

To use BlockyTalky's 'Music' blocks successfully, you'll need a machine set up to properly receive messages from BlockyTalky (BT) and play sounds. The music blocks in BT refer to such a machine as a 'maestro machine,' because it keeps time, and because alliteration.

Here's what to do.

1) Set up your maestro machine.
	a) Make sure the machine has pd-extended and ChucK installed.
	b) Start running music/maestro.ck and music/mastersound.pd
	c) Make sure the ChucK VM is running and the maestro.ck shred is added to it
	d) Make sure 'DSP' is on in Pure Data, and that it is configured properly to output sound on your machine.
	
2) Set up BT to send messages to the maestro machine.
	a) Use the 'specify maestro machine' block to specify the _local_ IP address of the maestro machine.
	b) Make sure the BT unit and the maestro machine are on the same local network.

3) Use music blocks in BT to make music!