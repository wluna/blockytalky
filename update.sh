#! /bin/bash
cd /home/pi/blockytalky
# git pull
[ "`git log --pretty=%H ...refs/heads/master^ | head -n 1`" = "`git ls-remote origin -h refs/heads/master |cut -f1`" ] && echo "Up to date" || git pull
