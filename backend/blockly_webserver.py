#!/usr/bin/env python
"""
Blocky Talky - Upload (upload.py)

This script is needed for the Blocky code to run on the Pi.

Authorization is based on:
    Coder auth app
    Flask Bcrypt - pythonhosted.org/Flask-Bcrypt/
    Flask HTTP Basic Auth - flask.pocoo.org/snippets/8/
"""

import os
import sys
from functools import wraps
from flask import Flask, request, Response, redirect, url_for, render_template
from flaskext.bcrypt import Bcrypt
from werkzeug._internal import _log
from message import *
import time, commands, subprocess, pika
import json

app = Flask(__name__)
bcrypt = Bcrypt(app)
device_settings = {
        'password_hash': '',
        'device_name': '',
        'hostname': '',
        'coder_owner': '',
        'coder_color': ''
        }

#_log('info', 'Server starting...')

#app.debug = True

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.queue_declare(queue='HwCmd')
toSend = Message('name', None, 'HwCmd', Message.createImage(motor1=0, motor2=0, motor3=0, motor4=0, pin13=0))
toSend = Message.encode(toSend)

upMsg = Message('name', None, 'HwCmd', Message.createImage(pin13=1))
upMsg = Message.encode(upMsg)
channel.basic_publish(exchange='', routing_key='HwCmd', body=upMsg)


os.chdir('/home/pi/blockytalky')

def load_device_settings():
    print "load devices settings"
    json_file = open('/home/coder/coder-dist/coder-base/device.json')
    device_json = json.load(json_file)
    print device_json
    device_settings = {
            'password_hash': device_json['password_hash'],
            'device_name': device_json['device_name'],
            'hostname': device_json['hostname'],
            'coder_owner': device_json['coder_owner'],
            'coder_color': device_json['coder_color']
            }
    json_file.close()

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

def check_auth(username, password):
    return (username == device_settings.device_name and
            bcrypt.check_password_hash(device_settings.password_hash, password))

@app.route('/blockly', methods = ['GET','POST'])
@requires_auth
def blockly():
    print 'hello'
    startMsg = Message('name', None, 'HwCmd', Message.createImage(pin13=0))
    startMsg = Message.encode(startMsg)
    try:    
	    channel.basic_publish(exchange='', routing_key='HwCmd', body=startMsg)
    except:
	    pass
    print 'got this far'
    return render_template('code.html')

@app.route('/upload', methods = ['GET', 'POST'])
@requires_auth
def upload():
    startTime = None
    endTime = None
    if request.method == 'POST':
        data = request.form
        data1 = data.copy()
        data2 = data1.get('<xml xmlns')
        _log('info', 'Blockly code received')

        toWrite = '<xml xmlns = ' + data2
        upload_code(toWrite)
        return 'OK'

def upload_code(code):
    startTime = time.time()
    fo = open('code/rawxml.txt', 'wb')
    fo.write(code)
    fo.close()
    endTime = time.time()
    print 'File took ' + str(endTime - startTime) + ' s'

    cmd = 'cd /home/pi/blockytalky/code && ' \
        '../../phantomjs/bin/phantomjs pjsblockly.js'

    startTime = time.time()
    subprocess.call(cmd, shell = True)
    endTime = time.time()
    print 'Subprocess pt1 took '+ str(endTime - startTime) + ' s'

    startTime = time.time()
    subprocess.call(['sudo pkill -9 -f user_script.py'], shell = True)
    endTime = time.time()
    print 'Subprocess pt2 took '+ str(endTime - startTime) + ' s'


    _log('info', 'Python written!')
    print 'Upload took '+ str(time.time() - startTime) + ' s'

@app.route('/stop', methods = ['GET', 'POST'])
@requires_auth
def stop():
    _log('info', 'Issuing kill command')
    subprocess.call(['sudo pkill -9 -f user_script.py'], shell = True)
    #commands.getstatusoutput('python /home/pi/blockytalky/code/kill.py')
    toSend = Message('name', None, 'HwCmd', Message.createImage(motor1=0, motor2=0, motor3=0, motor4=0, pin13=0))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange='', routing_key='HwCmd', body=toSend)
    return 'OK'

def update_sensors(sensors):
    assert len(sensors) == 4
    sensorMsg = Message('name', None, 'Sensor', 
                Message.createImage(sensor1=sensors[0],
                sensor2=sensors[1],
                sensor3=sensors[2],
                sensor4=sensors[3]
                ))
    sensorMsg = Message.encode(sensorMsg)
    channel.basic_publish(exchange='', routing_key='HwCmd', body=sensorMsg)

@app.route('/update', methods = ['GET', 'POST'])
@requires_auth
def update():
    sensors = [request.form['sensor1'],
               request.form['sensor2'],
               request.form['sensor3'],
               request.form['sensor4']]
    update_sensors(sensors)
    return 'OK'

@app.route('/run', methods = ['GET', 'POST'])
@requires_auth
def start():
    _log('info', 'Executing code on robot')
    # commands.getstatusoutput('python /home/pi/code/test.py')
    cmd = ['sudo python /home/pi/blockytalky/backend/user_script.py']
    p = subprocess.Popen(cmd, shell = True)
    return 'OK'

@app.route('/load', methods = ['GET', 'POST'])
@requires_auth
def load():
    url = url_for('static', filename='rawxml.txt', t=time.time())
    return redirect(url)

#TODO: Login and logout routes
# @app.route('/login', methods = ['GET'])
def login():
    return render_template('login.html')

# @app.route('/api_login', methods = ['POST'])
def api_login():
    if request.values.password and request.values.password != '':
        authenticated = check_auth(request.values.username, request.values.password)
    if authenticated:
        return Response(status='success')
    return authenticate()

# @app.route('/logout', methods = ['GET', 'POST'])
@requires_auth
def logout():
    # TODO
    pass

def authenticate():
    # TODO: Use a better response!!!
    return Response('Oops! You need to login with the right username and'
                    ' password to access BlockyTalky.', 401,
                    {'WWW-Authenticate': 'Basic realm="Login Required"'})

if __name__ == '__main__':
    load_device_settings()
    print device_settings
    app.run(host = '0.0.0.0')
