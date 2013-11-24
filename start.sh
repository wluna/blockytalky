#! /bin/bash

echo Starting BlockyTalky...

if [ `ps -ef | grep us.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep us.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "User Script killed"
fi

if [ `ps -ef | grep hardware_daemon.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep hardware_daemon.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "Hardware Daemon killed"
fi

if [ `ps -ef | grep blockly_webserver.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep blockly_webserver.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "WebServer killed"
fi

if [ `ps -ef | grep comms_module.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep comms_module.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "Communications Module killed"
fi


python /home/pi/blockytalky/backend/blockly_webserver.py &>/dev/null
python /home/pi/blockytalky/backend/comms_module.py &>/dev/null
sudo python /home/pi/blockytalky/backend/hardware_daemon.py &>/dev/null
#python /home/pi/blockytalky/backend/comms_module.py &>/dev/null

echo BlockyTalky running.
