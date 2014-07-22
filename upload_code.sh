#!/bin/bash

echo "Checking Internet connection..."

wget -q --tries=10 --timeout=5 http://www.google.com -O /tmp/index.google &> /dev/null
if [ ! -s /tmp/index.google ];then
	echo "No Internet connection, please try again later"
else
	echo "Online. Checking for files..."
	if [ "$(ls -A /home/pi/blockytalky/usercode)" ]; then
    	echo "Files found. Uploading files to remote server..."
    	cd /home/pi/blockytalky/usercode
    	scp * root@104.131.249.150:/root/logs/
    	rm *
	else
    	echo "No files to upload"
	fi
fi