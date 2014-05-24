#!/bin/sh

echo Starting BlockyTalky...

#if [ ! -f /etc/BlockyTalkyID ]; then
#    python /home/pi/blockytalky/generate_guid.py | sudo tee /etc/BlockyTalkyID > /dev/null
#fi

hostname | sudo tee /etc/BlockyTalkyID > /dev/null

if [ ! -f /home/pi/blockytalky/code/rawxml.txt ]; then
    touch /home/pi/blockytalky/code/rawxml.txt
    sudo echo '<xml xmlns = "http://www.w3.org/1999/xhtml"></xml>' > /home/pi/blockytalky/code/rawxml.txt
fi

if [ ! -f /home/pi/blockytalky/code/usercode.py ]; then
    touch /home/pi/blockytalky/code/usercode.py
fi

if [ ! -f /home/pi/cm.log ]; then
    touch /home/pi/cm.log
fi

if [ ! -d /home/pi/blockytalky/logs ]; then
    mkdir /home/pi/blockytalky/logs
fi

sudo chown pi /home/pi/blockytalky/code/rawxml.txt
sudo chmod 775 /home/pi/blockytalky/code/rawxml.txt

sudo chown pi /home/pi/blockytalky/code/usercode.py
sudo chmod 775 /home/pi/blockytalky/code/usercode.py

sudo chown pi /home/pi/cm.log
sudo chmod 664 /home/pi/cm.log

sudo python /home/pi/blockytalky/backend/blockly_webserver.py &>/dev/null
sudo python /home/pi/blockytalky/backend/comms_module.py &>/dev/null
sudo python /home/pi/blockytalky/backend/hardware_daemon.py &>/dev/null

echo BlockyTalky running.
