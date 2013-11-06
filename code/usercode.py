from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, channel):
  while True:

    if self.robot["sensors"][0] < 200:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor4=255))
      toSend = Message.encode(toSend)
      channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
      time.sleep(.01)
    else:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor4=-255))
      toSend = Message.encode(toSend)
      channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
      time.sleep(.01)
    