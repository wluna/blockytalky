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
import logging
import logging.handlers
from functools import wraps
from flask import Flask, request, Response, redirect, url_for, render_template
from flaskext.bcrypt import Bcrypt
from message import *
import time, commands, subprocess, pika
import jsonpickle

app = Flask(__name__)
bcrypt = Bcrypt(app)
logger = logging.getLogger('blockly_webserver')
device_settings = {
        'password_hash': '',
        'device_name': '',
        'hostname': '',
        'coder_owner': '',
        'coder_color': ''
        }

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
    try:
        json_file = open('/home/coder/coder-dist/coder-base/device.json', 'r')
        device_json = jsonpickle.decode(json_file.read())
        device_settings = {
                'password_hash': device_json['password_hash'],
                'device_name': device_json['device_name'],
                'hostname': device_json['hostname'],
                'coder_owner': device_json['coder_owner'],
                'coder_color': device_json['coder_color']
                }
        json_file.close()
    except Exception as e:
        logger.exception('Failed to open device settings file:')
    return device_settings

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

def check_auth(username, password):
    return (username == device_settings['device_name'] and
            bcrypt.check_password_hash(device_settings['password_hash'], password))

@app.route('/blockly', methods = ['GET','POST'])
@requires_auth
def blockly():
    startMsg = Message('name', None, 'HwCmd', Message.createImage(pin13=0))
    startMsg = Message.encode(startMsg)
    try:    
	    channel.basic_publish(exchange='', routing_key='HwCmd', body=startMsg)
    except:
	    pass
    return render_template('code.html')

@app.route('/upload', methods = ['GET', 'POST'])
@requires_auth
def upload():
    startTime = None
    endTime = None
    if request.method == 'POST':
        logger.info('Uploading code')
        data = request.form.copy()
        xml_data = data['xml']
        python_data = data['python']
        upload_code(xml_data, python_data);
        logger.info('Blockly code uploaded')
        return 'OK'

def code_to_file(code, file_name, file_label):
    logger.debug('Writing %s code:\n%s\n\n' % (file_name, code))
    startTime = time.time()
    fo = open(file_name, 'wb')
    fo.write(code)
    fo.close()
    endTime = time.time()
    logger.info('%s file took %fs' % (file_label, endTime - startTime))

def upload_code(xml_data, python_data):
    uploadStart = time.time()
    code_to_file(xml_data, 'code/rawxml.txt', 'XML')
    code_to_file(convert_usercode(python_data), 'backend/usercode.py', 'Python')

    startTime = time.time()
    try:
        subprocess.call(['sudo pkill -9 -f user_script.py'], shell = True)
    except Exception as e:
        logger.exception('Failed to stop Blockly code when uploading code:')
    endTime = time.time()
    logger.debug('Subprocess pt1 took '+ str(endTime - startTime) + ' s')

    logger.info('Upload took '+ str(time.time() - uploadStart) + ' s')

def convert_usercode(python_code):
    # Need to use two-space tabs for consistency with Blockly conversion
    python_code = "\n%s" % python_code
    usercode = ("from message import *\n"
                "import time\n"
                "import RPi.GPIO as GPIO\n"
                "import pyttsx\n\n"
                "def run(self, channel, channel2):\n"
                "  while True:\n"
                "%s" % python_code.replace("\n", "\n    "))
    return usercode

@app.route('/stop', methods = ['GET', 'POST'])
@requires_auth
def stop():
    logger.info('Issuing kill command')
    try:
        subprocess.call(['sudo pkill -9 -f user_script.py'], shell = True)
    except Exception as e:
        logger.exception('Failed to stop Blockly code:')
    #commands.getstatusoutput('python /home/pi/blockytalky/code/kill.py')
    toSend = Message('name', None, 'HwCmd', Message.createImage(motor1=0, motor2=0, motor3=0, motor4=0, pin13=0))
    toSend = Message.encode(toSend)
    try:
        channel.basic_publish(exchange='', routing_key='HwCmd', body=toSend)
    except:
        logger.exception('Failed to stop Blockly code:')
    return 'OK'

def update_sensors(sensors):
    try:
        assert len(sensors) == 4
    except AssertionError as e:
        logging.exception('Update request didn\'t contain 4 sensors:')
    sensorMsg = Message('name', None, 'Sensor', 
                Message.createImage(sensor1=sensors[0],
                sensor2=sensors[1],
                sensor3=sensors[2],
                sensor4=sensors[3]
                ))
    sensorMsg = Message.encode(sensorMsg)
    try:
        channel.basic_publish(exchange='', routing_key='HwCmd', body=sensorMsg)
    except:
        logger.exception('Failed to update sensors:')

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
    logger.info('Running code on robot')
    # commands.getstatusoutput('python /home/pi/code/test.py')
    cmd = ['sudo python /home/pi/blockytalky/backend/user_script.py']
    try:
        p = subprocess.Popen(cmd, shell = True)
    except:
        logger.exception('Failed to run code on robot:')
    return 'OK'

@app.route('/load', methods = ['GET', 'POST'])
@requires_auth
def load():
    logger.info('Loading Blockly code')
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
    handler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/blockly_ws.log',
                                                   maxBytes=5096, backupCount=3)
    formatter = logging.Formatter(fmt='%(asctime)s - %(levelname)s: %(message)s',
                                  datefmt='%H:%M:%S %d/%m')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    device_settings = load_device_settings()
    app.run(host = '0.0.0.0')
