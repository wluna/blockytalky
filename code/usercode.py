from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, channel):
  while True:

    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin11=1))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin7=1))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin7=1))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    