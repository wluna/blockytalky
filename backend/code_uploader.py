#!/usr/bin/evn python
"""
BlockyTalky - User code sender

This daemon periodically checks for new user code, then POSTs it 
to code_receiver.py, which is running on a remote server.
"""

import os
import time
import socket
import requests

os.nice(3)

class CodeSender(object):
	CHECK_INTERVAL = 60

	def __init__(self):
		self.unitname = socket.gethostname()
		self.headers = {'unit-name': self.unitname}

	def start(self):
		self.schedule_code_check()

	def schedule_code_check(self):
		#print "Scheduling a new check in %d seconds" % self.__class__.CHECK_INTERVAL
		time.sleep(self.__class__.CHECK_INTERVAL)
		self.check_code_and_reschedule()

	def check_code_and_reschedule(self):
		self.check_code()
		self.schedule_code_check()

	def check_code(self):
		"""
		Checks for code that has not yet been POSTed to the server (in usercode/), 
		and sends it. After the code is sent, files are locally moved to sentcode/, 
		otherwise files remain in the directory as the POST failed.
		"""

		os.chdir('/home/pi/blockytalky/usercode/')
		
		for file in os.listdir('/home/pi/blockytalky/usercode/'):
			fo = open(file, "rb")
			code = fo.read()
			fo.close()
			try:
				request = requests.post("http://104.131.249.150:5000", data=code, headers=self.headers)
				newfile = "/home/pi/blockytalky/sentcode/" + str(file)
				os.rename(file, newfile)
			except:
				# POST failed, leave file, try again next loop
				pass

if __name__ == "__main__":
	cs = CodeSender()
	cs.start()