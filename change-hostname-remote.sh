#! /bin/bash

nhost=$1
chost=$(hostname)

echo $nhost | sudo tee /etc/hostname /boot/coder_settings/hostname.txt > /dev/null

sudo sed -i -e "s/$chost/$nhost/g" /etc/hosts
sudo sed -i -e "s/ironman/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf

sudo sed -i -e "s/$chost/$nhost/g" /home/coder/coder-dist/coder-base/device.json
sudo sed -i -e "s/ironman/$nhost/g" /home/coder/coder-dist/coder-base/device.json

sudo sed -i -e "s/$chost/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf
sudo sed -i -e "s/sentinel/$nhost/g" /etc/wpa_supplicant/wpa_supplicant.conf
hostname | sudo tee /etc/BlockyTalkyID > /dev/null
