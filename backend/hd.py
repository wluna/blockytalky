#!/usr/bin/env python
"""
Blocky Talky - Hardware Daemon (hd.py, RabbitMQ client)

This module keeps the userscript on the Pi updated with sensor values and it
also directly controls the hardware.
"""
import time
import threading
import logging
import socket
import pika
from message import *
from BrickPi import *

channel = None

class HardwareDaemon(object):
    # Init hardware status and name, declare queues for the hardware, inits hardware
    def __init__(self):
        self.hostname = socket.gethostname()
        self.robot = Message.initStatus()
        initPins()
        BrickPiSetup()
        BrickPi.MotorEnable[PORT_A] = 1
        BrickPi.MotorEnable[PORT_B] = 1
        BrickPi.MotorEnable[PORT_C] = 1
        BrickPi.MotorEnable[PORT_D] = 1

        BrickPiSetupSensors()

    def checkStatus(self):
        """
        Applies the changes made to LEDs and motors and sends a message to HwVal
        channel every time a hardware value changes on the robot.
        """
        valuesChanged = False
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        channel.queue_declare(queue="HwVal")
        while True:
            BrickPi.Led = self.robot["leds"]
            BrickPi.MotorSpeed = self.robot["motors"]
            BrickPi.Gpio = self.robot["pins"]
            BrickPiUpdateValues()

            #Copy sensors and encoders for comparison.
            sensors = BrickPi.Sensor[:]
            encoders = BrickPi.Encoder[:]

            encoders.pop(2)
            encoders.pop(2)

            #Check to see if sensor or encoder status has changed.
            for index, sensor in enumerate(sensors):
               if abs(int(sensor) - self.robot["sensors"][index]) > 15:
                   self.robot["sensors"][index] = sensor
                   if not valuesChanged:
                       valuesChanged = True

            for index, encoder in enumerate(encoders):
               if abs((encoder) - (self.robot["encoders"][index])) > 15:
                   self.robot["encoders"][index] = encoder
                   if not valuesChanged:
                       valuesChanged = True

            #valuesChanged = True
            if valuesChanged:   
                # Send a status message with the updated values.
                content = Message.createImage(
                                                encoder1 = encoders[0],
                                                encoder2 = encoders[1],
                                                sensor1 = sensors[0],
                                                sensor2 = sensors[1],
                                                sensor3 = sensors[2],
                                                sensor4 = sensors[3]
                                             )
                statusMessage = Message(self.hostname, None, "HwVal", content)
                statusMessage = Message.encode(statusMessage)
                #print str(statusMessage)
                channel.basic_publish(exchange='', routing_key='HwVal', body=statusMessage)
                valuesChanged = False

    def on_connected(self, connection):
        connection.channel(hd.on_channel_open)

    def on_channel_open(self, new_channel):
        global channel
        channel = new_channel
        self.channel = new_channel
        self.prevMessage = Message("none", None, "HwCmd", Message.createImage(pin11=2))
        channel.queue_declare(queue="HwCmd", callback=hd.on_queue_declared)

    def on_queue_declared(self, frame):
        channel.basic_consume(hd.handle_delivery, queue='HwCmd', no_ack=True)

    def handle_delivery(self, channel, method, header, body):
        command = Message.decode(body)
        print str(command)
        if command.channel == "Sensor":
            port = None
            newType = None
            sensorDict = command.getContent()
            for key, valueList in sensorDict.iteritems():
                for index, value in enumerate(valueList):
                    if value is not None:
                        if value == "touch":
                            newType = TYPE_SENSOR_TOUCH
                        elif value == "ultra":
                            newType = TYPE_SENSOR_ULTRASONIC_CONT
                        elif value == "sound":
                            newType = TYPE_SENSOR_RAW
                        elif value == "light":
                            newType = TYPE_SENSOR_LIGHT_ON

                        BrickPi.SensorType[index] = newType
            BrickPiSetupSensors()

        else:
            hwDict = command.getContent()
            if command == self.prevMessage:
                # Message is the same, do nothing
                pass
            else:
                for key, valueList in hwDict.iteritems():
                    for index, value in enumerate(valueList):
                        if value is not None:
                            self.robot[key][index] = value
                logging.debug("Command: " + str(hwDict))
            self.prevMessage = command


if __name__ == "__main__":
    # Set the logging level.
    logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                        # filename = "hd.log",
                        level = logging.ERROR)
    hd = HardwareDaemon()
    checkStatusThread = threading.Thread(target = hd.checkStatus, args = ())
    checkStatusThread.daemon = True
    checkStatusThread.start()

    parameters = pika.ConnectionParameters()
    hd.connection = pika.SelectConnection(parameters, hd.on_connected)
    hd.connection.ioloop.start()
