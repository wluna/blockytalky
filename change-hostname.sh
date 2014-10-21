#! /bin/bash
echo "BT hostname changer"
echo "Enter a hostname: "
read nhost
chost=$(hostname)
sudo echo $nhost > /etc/hostname
sudo sed -i -e "s/$chost/$nhost/g" /etc/hosts
sudo echo $nhost > /boot/coder_settings/hostname.txt
sudo sed -i -e "s/$chost/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf