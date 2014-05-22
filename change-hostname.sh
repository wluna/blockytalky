#! /bin/bash
echo "BT hostname changer"
echo "Enter a hostname: "
read nhost

sh /home/pi/blockytalky/change-hostname-remote.sh $nhost

echo "Hostname change complete. Restarting your BlockyTalky unit. To cancel, press CTRL-C"
echo "5..."
sleep 1
echo "4..."
sleep 1
echo "3..."
sleep 1
echo "2..."
sleep 1
echo "1..."
sleep 1
echo "Shutting down now"

sudo reboot
