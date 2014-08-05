#! /bin/bash
sudo modprobe snd-bcm2835

if [ -f /etc/init/bthd.conf ]; then
	sudo mv /etc/init/bthd.conf /etc/init/blockytalky_hd.conf
fi

cd /home/pi/blockytalky

git pull
