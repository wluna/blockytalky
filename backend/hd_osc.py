#!/usr/bin/env python
"""
Blocky Talky - Hardware Daemon (hd.py, WebSocket client)

This module keeps the userscript on the Pi updated with sensor values and it
also directly controls the hardware.
"""
import time
import threading
import logging
import socket
import websocket           # Install via "pip install websocket-client"
from blockytalky_id import *
from message import *
from BrickPi import *

class HardwareDaemon(object):
    def __init__(self):
        self.hostname = BlockyTalkyID()
        self.robot = Message.initStatus()
        # Startup message to subscribe to hwCmd channel.
        self.handshake = Message(self.hostname, None, "Subs", ("HwCmd",))
        self.handshake = Message.encode(self.handshake)

    def checkStatus(self, ws):
        """
        Applies the changes made to LEDs and motors and sends a message to HwVal
        channel every time a hardware value changes on the robot.
        """
        valuesChanged = False
        while True:
            BrickPi.Led = self.robot["leds"]
            BrickPi.MotorSpeed = self.robot["motors"]
            BrickPiUpdateValues()

            # Copy sensors and encoders for comparison.
            sensors = BrickPi.Sensor[:]
            encoders = BrickPi.Encoder[:]

            # Check to see if sensor or encoder status has changed.
            for index, sensor in enumerate(sensors):
                if abs(sensor - self.robot["sensors"][index]) > 10:
                    self.robot["sensors"][index] = sensor
                    if not valuesChanged:
                        valuesChanged = True

            for index, encoder in enumerate(encoders):
                if abs(encoder - self.robot["encoders"][index]) > 10:
                    self.robot["encoders"][index] = encoder
                    if not valuesChanged:
                        valuesChanged = True

            if valuesChanged:
                # Send a status message with the updated values.
                content = Message.createImage(
                                                encoder1 = encoders[0],
                                                encoder2 = encoders[1],
                                                encoder3 = encoders[2],
                                                sensor1 = sensors[0],
                                                sensor2 = sensors[1],
                                                sensor3 = sensors[2],
                                                sensor4 = sensors[3]
                                             )
                statusMessage = Message(self.hostname, None, "HwVal", content)
                statusMessage = Message.encode(statusMessage)
                ws.send(statusMessage)
                valuesChanged = False
            time.sleep(0.1)

    def onOpen(self, ws):
        logging.info("Connection opened.")
        ws.send(self.handshake)

    def onError(self, ws, error):
        logging.error("A WebSocket error has occured.")

    def onMessage(self, ws, message):
        hwDict = Message.decode(message).getContent()
        for key, valueList in hwDict.iteritems():
            for index, value in enumerate(valueList):
                if value is not None:
                    self.robot[key][index] = value
        logging.debug("Command: " + str(hwDict))

    def onClose(self, ws):
        logging.info("Connection closed.")

if __name__ == "__main__":
    # Set the logging level.
    logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                        # filename = "hd.log",
                        level = logging.DEBUG)
    hd = HardwareDaemon()
    ws = websocket.WebSocketApp("ws://localhost:8888/mp",
                                on_open = hd.onOpen,
                                on_message = hd.onMessage,
                                on_error = hd.onError,
                                on_close = hd.onClose)
    checkStatusThread = threading.Thread(target = hd.checkStatus, args = (ws,))
    checkStatusThread.daemon = True
    checkStatusThread.start()
    ws.run_forever()
