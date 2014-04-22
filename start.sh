#! /bin/bash

echo Starting BlockyTalky...

if [ ! -f /etc/BlockyTalkyID ]; then
    python /home/pi/blockytalky/generate_guid.py | sudo tee /etc/BlockyTalkyID > /dev/null
fi

if [ ! -f /home/pi/blockytalky/code/rawxml.txt ]; then
    sudo touch /home/pi/blockytalky/code/rawxml.txt
    sudo chown pi /home/pi/blockytalky/code/rawxml.txt
fi

sudo chmod 775 /home/pi/blockytalky/code/rawxml.txt
sudo echo '<xml xmlns = "http://www.w3.org/1999/xhtml"></xml>' > /home/pi/blockytalky/code/rawxml.txt

if [ ! -f /home/pi/blockytalky/code/usercode.py ]; then
    touch /home/pi/blockytalky/code/usercode.py
fi

sudo chown pi /home/pi/blockytalky/code/usercode.py
sudo chmod 775 /home/pi/blockytalky/code/usercode.py


python /home/pi/blockytalky/backend/blockly_webserver.py &>/home/pi/blockytalky/bw_log
python /home/pi/blockytalky/backend/comms_module.py &>/home/pi/blockytalky/cm_log
sudo python /home/pi/blockytalky/backend/hardware_daemon.py &>/home/pi/blockytalky/hd_log
#python /home/pi/blockytalky/backend/comms_module.py &>/dev/null

echo BlockyTalky running.
