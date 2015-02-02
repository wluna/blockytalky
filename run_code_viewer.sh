#!/bin/bash
if [[ ! `which pip`]]; then
  wget "https://bootstrap.pypa.io/get-pip.py"
  python get-pip.py
fi

flask=`pip list | grep "Flask "`
bcrypt=`pip list | grep "FLASK-Bcrypt "`
request=`pip list | grep "requests "`
pika=`pip list | grep "pika "`
if [[! flask]]; then
  pip install flask
fi
if [[! bcrypt]]; then
  pip install flask-bcrypt
fi
if [[! request]]; then
  pip install requests
fi
if [[! pika]]; then
  pip install pika
fi

python backend/view_server.py
