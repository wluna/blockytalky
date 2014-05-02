#! /bin/bash
echo "BT hostname changer"
echo "Enter a hostname: "
read nhost
chost=$(hostname)
sudo echo $nhost > /etc/hostname
sudo sed -i -e "s/$chost/$nhost/g" /etc/hosts
sudo echo $nhost > /boot/coder_settings/hostname.txt
sudo sed -i -e "s/$chost/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf 
sudo sed -i -e "s/$chost/$nhost/g" /home/coder/coder-dist/coder-base/device.json

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
