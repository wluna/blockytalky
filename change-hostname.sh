#! /bin/bash
echo "BT hostname changer"
echo "Enter a hostname: "
read nhost
chost=$(hostname)

echo $nhost | sudo tee /etc/hostname /boot/coder_settings/hostname.txt > /dev/null

sudo sed -i -e "s/$chost/$nhost/g" /etc/hosts
sudo sed -i -e "s/ironman/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf

sudo sed -i -e "s/\"hostname\": \"[a-zA-Z0-9]*\",/\"hostname\": \"$nhost\",/g" /home/coder/coder-dist/coder-base/device.json
sudo sed -i -e "s/\"device\_name\": \"[a-zA-Z0-9]*\",/\"device\_name\": \"$nhost\",/g" /home/coder/coder-dist/coder-base/device.json

sudo sed -i -e "s/BT-$chost/BT-$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/sentinel/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf

sudo sed -i -e "s/$chost/$nhost/g" /home/coder/coder-dist/coder-base/server.js
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

sudo shutdown -r now
