from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, channel, channel2):
  while True:

    if self.robot["sensors"][0] == 1:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=1))
      toSend = Message.encode(toSend)
      channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
      time.sleep(.01)
    else:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=0))
      toSend = Message.encode(toSend)
      channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
      time.sleep(.01)
    