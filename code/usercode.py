from message import *
import time
import RPi.GPIO as GPIO
import pyttsx

def run(self, channel, channel2):
  while True:

    toSend = Message(self.hostname, "ironman", "Message", "go")
    toSend = Message.encode(toSend)
    channel2.basic_publish(exchange="", routing_key="Message", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, "mystique", "Message", "go")
    toSend = Message.encode(toSend)
    channel2.basic_publish(exchange="", routing_key="Message", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=0))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    time.sleep(0.5)
    toSend = Message(self.hostname, "mystique", "Message", "go")
    toSend = Message.encode(toSend)
    channel2.basic_publish(exchange="", routing_key="Message", body=toSend)
    time.sleep(.01)
    toSend = Message(self.hostname, None, "HwCmd", Message.createImage(pin13=1))
    toSend = Message.encode(toSend)
    channel.basic_publish(exchange="", routing_key="HwCmd", body=toSend)
    time.sleep(.01)
    time.sleep(0.5)
    