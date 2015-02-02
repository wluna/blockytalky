#!/bin/bash
if [[ -z `which pip` ]]; then
  wget "https://bootstrap.pypa.io/get-pip.py"
  python get-pip.py
fi

flask=`pip list | grep "Flask "`
bcrypt=`pip list | grep "FLASK-Bcrypt "`
request=`pip list | grep "requests "`
pika=`pip list | grep "pika "`
if [[ -z flask ]]; then
  pip install flask
fi
if [[ -z bcrypt ]]; then
  pip install flask-bcrypt
fi
if [[ -z request ]]; then
  pip install requests
fi
if [[ -z pika ]]; then
  pip install pika
fi

python backend/view_server.py &
# http://localhost:5000/blockly
python -mwebbrowser http://localhost:5000/blockly
