#! /bin/bash
cd /home/pi/blockytalky
sudo modprobe snd-bcm2835
git fetch --all
git reset --hard origin/master
