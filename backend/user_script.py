#!/usr/bin/env python
"""
Blocky Talky - User Script (us.py, RabbitMQ client)

The module that works with the program written in the Blocky Talky GUI.
"""
import time
import thread
import logging
import socket
import usercode
import pika
import atexit
from blockytalky_id import *
from message import *
import urllib2

logger = logging.getLogger('user_script')

class UserScript(object):
    def __init__(self):
        logger.info('Initializing user script object')
        self.hostname = BlockyTalkyID()
        self.msgQueue = []
        self.robot = Message.initStatus()
        
        #true if unread data from sensor
        self.sensorStatus= Message.createSensorStatus()
        logger.debug(self.sensorStatus.values())


    def executeScript(self):
        """
        Resets the robot to its default state and runs the script downloaded
        from Google Blockly via usercode.run().
        """
        global channel2

        # Initialize local image to the default state.
        self.robot = Message.initStatus()
        # Runs the user code generated by Blockly.
        logger.info('Running usercode.py ...')
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        channel.queue_declare(queue="HwCmd")
        connection2 = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel2 = connection2.channel()
        channel2.queue_declare(queue="Message")
        usercode.run(self, channel, channel2)

    def getSensorValue(self, sensorType, port):
        key = sensorType + str(port+1)
        #print key
        self.sensorStatus[key] = False
        return self.robot[sensorType+'s'][port]
        

    def checkContent(self, content):
        """ used with "message that says: ____" blocks.  returns true if first
        element in message queue has the desired content.  otherwise
        returns false
        """
        if self.msgQueue:
            logger.debug('Message queue contains %d messages' % len(self.msgQueue))
            if self.msgQueue[0].getContent() == content:
                logger.debug('Message matches content \'%s\'' % content)
                del self.msgQueue[0]
                return True
        return False

    def checkSource(self, source):
        """ used with "message from: ____" blocks.  returns true if first
        element in message queue is from the desired client.  otherwise
        returns false
        """
        if self.msgQueue:
            logger.debug('Message queue contains %d messages' % len(self.msgQueue))
            if self.msgQueue[0].getSource() == source:
                logger.debug('Message matches source \'%s\'' % source)
                del self.msgQueue[0]
                return True
        return False

    def on_connected(self, connection):
        connection.channel(us.on_channel_open)

    def on_channel_open(self, new_channel):
        global channel
        channel = new_channel
        self.channel = new_channel
        channel.queue_declare(queue="HwVal", callback=us.on_queue_declared)

    def on_queue_declared(self, frame):
        channel.basic_consume(us.handle_delivery, queue="HwVal", no_ack=True)

    def handle_delivery(self, channel, method, header, body):
        """
        The incoming message is either a hardware status update, a command sent
        by another Pi or a social media status update.
            # On HW message: update the robot
            # On Pi message: add to message queue
            # On SM message: TBD
        """
        # For testing purposes
        message = Message.decode(body)
        if message.getChannel() == "Message":
            # If it's a "do this" type message ...
            logger.debug('Adding message from %s with content \'%s\'' % (message.getSource(), message.getContent()))
            self.msgQueue.append(message)
        elif message.getChannel() == "Subs":
            logger.debug('Message for Subs channel: \'%s\'' % message.getContent())
            usercode.run(self, self.channel)
        else:
            # If it's a robot status update ...
            hwDict = message.getContent()
            logger.debug('Updating the robot status: %s' % str(hwDict))
            # Apply the value changes
            for key, valueList in hwDict.iteritems():
                for index, value in enumerate(valueList):
                    if value is not None:
                        self.robot[key][index] = value
        
            #tells user script that there is unread data on all ports
            for sensor in self.sensorStatus:
                self.sensorStatus[sensor]= True

if __name__ == "__main__":
    # Set the logging level.
    handler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/user_script.log',
                                                   maxBytes=5096, backupCount=3)
    globalHandler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/master.log',
                                                         maxBytes=5096, backupCount=3)
    formatter = logging.Formatter(fmt='%(asctime)s - %(levelname)s: %(message)s',
                                  datefmt='%H:%M:%S %d/%m')
    handler.setFormatter(formatter)
    globalHandler.setFormatter(formatter)
    globalHandler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.addHandler(globalHandler)
    logger.setLevel(logging.INFO)

    us = UserScript()
    thread.start_new(us.executeScript, ())

    parameters = pika.ConnectionParameters()
    connection = pika.SelectConnection(parameters, us.on_connected)
    connection.ioloop.start()
