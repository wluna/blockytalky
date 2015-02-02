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
from flask.ext.bcrypt import Bcrypt
from message import *
import time, commands, subprocess, pika
import jsonpickle
import requests
import socket

app = Flask(__name__)
bcrypt = Bcrypt(app)
logger = logging.getLogger(__name__)

@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html')

@app.route('/blockly', methods = ['GET','POST'])
def code():
    return render_template('code.html')

@app.route('/upload', methods = ['GET', 'POST'])
#@requires_auth
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
    #code_to_file(convert_usercode(python_data), 'backend/usercode.py', 'Python')
    code_to_file(convert_usercode(python_data), 'backend/user_script.py', 'Python')
    save_locally(xml_data)
    startTime = time.time()
    logger.info('Issuing kill command before uploading code')
    stop_user_script()
    endTime = time.time()
    logger.debug('Subprocess pt1 took '+ str(endTime - startTime) + ' s')

    logger.info('Upload took '+ str(time.time() - uploadStart) + ' s')

def save_locally(code):
    os.chdir('/home/pi/blockytalky/usercode')
    filename = socket.gethostname() + "-" + str(int(round(time.time() * 1000)))
    fo = open(filename, 'wb')
    fo.write(code)
    fo.close()
    os.chdir('/home/pi/blockytalky')


def convert_usercode(python_code):
    # Need to use two-space tabs for consistency with Blockly conversion
    python_code = "\n%s" % python_code
    python_code += "\n"
    python_code = python_code.splitlines()
    callback_functions = "    def init_callbacks(self): \n"
    while_functions = "    def init_whiles(self): \n"
    msg_functions = "    def init_msgs(self): \n"
    variables = "\n      global "

    # comment out code that comes from blocks not in event blocks.
    comment = True
    i = 0
    while i < len(python_code):
        if python_code[i].isspace() or python_code[i] == "":
            comment = False
        elif python_code[i][-7:] == " = None":
            comment = False
            var = python_code[i][:python_code[i].index('=')-1]
            variables += var + ", "            

        elif python_code[i][:4] == "def ":
            func = python_code[i][python_code[i].find(" ")+1:python_code[i].find("(")]
            if func[0] != "_":
                if variables != "\n      global ":
                    python_code[i] += variables[:-2]
                if func == "run_continuously":
                    python_code[i] += "\n      for f in self.whiles: \n        f() \n"    
                if func[:2] == "wl":
                    while_functions += "        self.whiles.append(self." + func + ") \n"
                if func[:2] == "wm":
                    msg_functions += "        self.msg_functions.append(self." + func + ") \n"
                else:    
                    callback_functions += "        self.callbacks.append(self." + func + ") \n"
            comment = False
            while not (python_code[i].isspace() or python_code[i] == ""):
                i += 1
        else:
            comment = True
                
        if comment == True:
            python_code[i] = "#" + python_code[i]
        i += 1

    python_code = ["    " + x for x in python_code]
    python_code = "\n".join(python_code)

    callback_functions += "        if self.run_on_start in self.callbacks: self.callbacks.remove(self.run_on_start) \n        if self.run_continuously in self.callbacks: self.callbacks.remove(self.run_continuously) \n"

    while_functions += "        True \n"
    
    msg_functions += "        True \n"

    python_code += "\n" + callback_functions + "\n" + while_functions + "\n" + msg_functions + "\n"

    print python_code
    
    user_script_header = open('backend/us_header', 'r')
    header_text = user_script_header.read()
    
    footer_text = ('if __name__ == "__main__": \n'
                   '    handle_logging(logger) \n'
                   '    uscript = UserScript() \n'
                   '    uscript.handshake() \n'
                   '    uscript.start() \n')


    return header_text + python_code + footer_text 

if __name__ == '__main__':
    # handler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/blockly_ws.log',
    #                                                maxBytes=8192, backupCount=3)
    # globalHandler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/master.log',
    #                                                      maxBytes=16384, backupCount=3)
    # formatter = logging.Formatter(fmt='%(asctime)s - %(levelname)s: %(message)s',
    #                               datefmt='%H:%M:%S %d/%m')
    # handler.setFormatter(formatter)
    # globalHandler.setFormatter(formatter)
    # logger.addHandler(handler)
    # logger.addHandler(globalHandler)
    logger.setLevel(logging.INFO)

    #device_settings = load_device_settings()
    app.run(host = '0.0.0.0')
