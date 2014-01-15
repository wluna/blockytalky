#! /bin/bash
echo "BT hostname changer"
echo "Enter a hostname: "
read hostname
sudo echo $hostname > /etc/hostname
sudo sed -i -e "s/ironman/$hostname/g" /etc/hosts
sudo echo $hostname > /boot/coder_settings/hostname.txt
sudo sed -i -e "s/ironman/$hostname/g" /etc/wpa_supplicant/wpa_supplicant.conf
