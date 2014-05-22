#! /bin/bash

nhost=$1
chost=$(cat /etc/hostname)
rand=$(date +%s | sha256sum | head -c 32)

# Replace the current name with a random string in case, e.g., the new name
# is a shorter version of the old one
# NOTE: The last part should be changed when the units start to use GUIDs!!!
echo $nhost | sudo tee /etc/hostname /boot/coder_settings/hostname.txt /etc/BlockyTalkyID > /dev/null

sudo sed -i -e "s/$chost/$rand/g" /etc/hosts
sudo sed -i -e "s/ironman/$rand/g" /etc/hosts
sudo sed -i -e "s/loki/$rand/g" /etc/hosts
sudo sed -i -e "s/$rand/$nhost/g" /etc/hosts

sudo sed -i -e "s/$chost/$rand/g" /home/coder/coder-dist/coder-base/device.json
sudo sed -i -e "s/ironman/$rand/g" /home/coder/coder-dist/coder-base/device.json
sudo sed -i -e "s/loki/$rand/g" /home/coder/coder-dist/coder-base/device.json
sudo sed -i -e "s/$rand/$nhost/g" /home/coder/coder-dist/coder-base/device.json

sudo sed -i -e "s/$chost/$rand/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/sentinel/$rand/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/ironman/$rand/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/loki/$rand/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/$rand/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf
