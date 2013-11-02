from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, ws):
  while True:

    if self.robot["sensors"][0] < 255:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor3=255))
      ws.send(Message.encode(toSend))
      time.sleep(.05)
    else:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor3=0))
      ws.send(Message.encode(toSend))
      time.sleep(.05)
    