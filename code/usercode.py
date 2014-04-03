from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, channel, channel2):
  while True:

    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=1))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=100))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    time.sleep(1)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=0))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(motor1=0))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    time.sleep(1)
    