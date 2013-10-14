#!/usr/bin/env python
"""
Blocky Talky - Upload (upload.py)

This script is needed for the Blocky code to run on the Pi.
"""
import os
from flask import Flask, request, redirect, url_for, render_template
from werkzeug._internal import _log
import time, commands, subprocess

app = Flask(__name__)

_log('info', 'Server starting...')

app.debug = True

@app.route("/blockly", methods = ["GET","POST"])
def blockly():
    return render_template('code.html')

@app.route("/upload", methods = ["GET", "POST"])
def upload():
    startTime = None
    endTime = None
    if request.method == "POST":
        data = request.form
        data1 = data.copy()
        data2 = data1.get('<xml xmlns')
        _log('info', 'Blockly code received')
        toWrite = "<xml xmlns = " + data2

        startTime = time.time()
        fo = open("../code/rawxml.txt", "wb")
        fo.write(toWrite)
        fo.close()
        endTime = time.time()
        print 'File took ' + str(endTime - startTime) + ' s'

        cmd = "cd ~/blockytalky/code && " \
            "../../phantomjs/bin/phantomjs pjsblockly.js"

        startTime = time.time()
        subprocess.call(cmd, shell = True)
        endTime = time.time()
        print 'Subprocess pt1 took '+ str(endTime - startTime) + ' s'

        startTime = time.time()
        subprocess.call(["sudo pkill -9 -f us.py"], shell = True)
        endTime = time.time()
        print 'Subprocess pt2 took '+ str(endTime - startTime) + ' s'


        _log('info', 'Python written!')
        print 'Upload took '+ str(time.time() - startTime) + ' s'
        return 'OK'

@app.route("/stop", methods = ["GET", "POST"])
def stop():
    _log('info', 'Issuing kill command')
    subprocess.call(["sudo pkill -9 -f us.py"], shell = True)
    commands.getstatusoutput('python ~blockytalky/code/kill.py')
    return 'OK'

@app.route("/run", methods = ["GET", "POST"])
def start():
    _log('info', 'Executing code on robot')
    # commands.getstatusoutput('python /home/pi/code/test.py')
    cmd = ['sudo python ~/blockytalky/backend/us.py']
    p = subprocess.Popen(cmd, shell = True)
    return 'OK'

@app.route("/load", methods = ["GET", "POST"])
def load():
    url = url_for('static', filename='rawxml.txt', t=time.time())
    return redirect(url)

if __name__ == "__main__":
	app.run(host = "0.0.0.0")
