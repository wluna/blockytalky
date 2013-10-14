#! /bin/bash

echo Starting BlockyTalky...

if [ `ps -ef | grep us.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep us.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "User Script killed"
fi

if [ `ps -ef | grep mp.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep mp.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "Message Passer killed"
fi

if [ `ps -ef | grep hd.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep hd.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "Hardware Daemon killed"
fi

if [ `ps -ef | grep upload.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep upload.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "WebServer killed"
fi

if [ `ps -ef | grep cm.py | grep -v grep | awk '{print $2}'` ]
    then
        kill -9 `ps -ef | grep cm.py | grep -v grep | awk '{print $2}'` &>/dev/null
	echo "Communications Module killed"
fi


python ~/blockytalky/backend/upload.py &>/dev/null

python ~/blockytalky/backend/mp.py &>/dev/null
sleep 3
sudo python ~/blockytalky/backend/hd.py &>/dev/null
python ~/blockytalky/backend/cm.py &>/dev/null

echo BlockyTalky running.
