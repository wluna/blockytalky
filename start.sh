#!/bin/sh

echo Starting BlockyTalky...

sudo chown -R pi /home/pi/blockytalky/*

#if [ ! -f /etc/BlockyTalkyID ]; then
#    python /home/pi/blockytalky/generate_guid.py | sudo tee /etc/BlockyTalkyID > /dev/null
#fi

hostname | sudo tee /etc/BlockyTalkyID > /dev/null

if [ ! -f /home/pi/blockytalky/code/rawxml.txt ]; then
    touch /home/pi/blockytalky/code/rawxml.txt
    sudo echo '<xml xmlns = "http://www.w3.org/1999/xhtml"></xml>' > /home/pi/blockytalky/code/rawxml.txt
fi

if [ ! -f /home/pi/cm.log ]; then
    touch /home/pi/cm.log
fi

if [ ! -d /home/pi/blockytalky/logs ]; then
    mkdir /home/pi/blockytalky/logs
fi

sudo chown pi /home/pi/blockytalky/code/rawxml.txt
sudo chmod 775 /home/pi/blockytalky/code/rawxml.txt

sudo chown pi /home/pi/blockytalky/logs/blockly_ws.log
sudo chmod 775 /home/pi/blockytalky/logs/blockly_ws.log

sudo chown pi /home/pi/blockytalky/logs/comms_module.log
sudo chmod 775 /home/pi/blockytalky/logs/comms_module.log

sudo chown pi /home/pi/blockytalky/logs/master.log
sudo chmod 775 /home/pi/blockytalky/logs/master.log

sudo chown pi /home/pi/blockytalky/logs/hardware_daemon.log
sudo chmod 775 /home/pi/blockytalky/logs/hardware_daemon.log

sudo chown pi /home/pi/cm.log
sudo chmod 664 /home/pi/cm.log

sudo chown pi /home/pi/blockytalky/backend/user_script.py
sudo chmod 775 /home/pi/blockytalky/backend/user_script.py

python /home/pi/blockytalky/backend/blockly_webserver.py &>/dev/null
python /home/pi/blockytalky/backend/code_uploader.py &>/dev/null
python /home/pi/blockytalky/backend/comms_module.py &>/dev/null
if [! -f /etc/init/blockytalky_hd.conf ]; then
python /home/pi/blockytalky/backend/hardware_daemon.py &>/dev/null
fi

echo BlockyTalky running.
