#!/usr/bin/env python
import pika
from message import *
import time

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()

channel.queue_declare(queue="HwCmd")


while True:
	toSend = Message("coder", None, "HwCmd", Message.createImage(pin13=1))
	toSend = Message.encode(toSend)
	channel.basic_publish(exchange='',
                      routing_key='HwCmd',
                      body=toSend)
	time.sleep(.1)
	toSend = Message("coder", None, "HwCmd", Message.createImage(pin13=0))
	toSend = Message.encode(toSend)
	channel.basic_publish(exchange='',
                      routing_key='HwCmd',
                      body=toSend)
	time.sleep(.1)


connection.close()