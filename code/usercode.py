from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, ws):
  while True:

    if self.robot["sensors"][0] < 200:
      toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=255))
      channel.basic_publish(exchange="", routing_key="HwVal", body=toSend)
      time.sleep(.05)
    