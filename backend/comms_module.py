#!/usr/bin/env python
"""
Blocky Talky - Communicator Module (cm.py, WebSocket client)

The intermediary between DAX and the Pi Message Passer module.
"""
import logging
import socket
import threading
import time
import websocket
import pika
import blockly_webserver
import urllib
import json
from collections import deque
from blockytalky_id import *
from message import *

logger = logging.getLogger(__name__)

class Communicator(object):
    hostname = BlockyTalkyID()
    recipients = {}                     # Filled by "createWebSocket"
    restartQueue = deque()
    global channelOut
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channelOut = connection.channel()
    channelOut.queue_declare(queue="HwVal")

    mostRecentCode = None

    @staticmethod
    def onOpen(ws):
        logger.debug(">>> Method called: onOpen")
        logger.info("Connection opened: DAX")
        msg = Message(Communicator.hostname, "dax", "Subs", ())
        msg = Message.encode(msg)
        ws.send(msg)

    @staticmethod
    def onError(ws, error):
        if error:
            logger.error("A WebSocket error has occured: %s" % str(error))
        else:
            logger.error("An unknown WebSocket error has occurred")

    @staticmethod
    def onClose(ws):
        logger.debug(">>> Method called: onClose")
        logger.info("Connection closed.")
        Communicator.restartQueue.append(ws)

    @staticmethod    
    def onRemoteMessage(ws, encodedMessage):
        """ This method handles messages coming from DAX. """
        logger.debug(">>> Method called: onRemoteMessage")
        logger.info("Remote message received. Forwarded locally")
        decoded = Message.decode(encodedMessage)
        if decoded.getChannel() == "Server":
            logger.info("Received server command")
            Communicator.respondToServerMessage(decoded)
        else:
            channelOut.basic_publish(exchange="", routing_key="HwVal", body=encodedMessage)

    #Respond to a command originating from the main server (rails, not dax)
    @staticmethod
    def respondToServerMessage(message):
        content = message.getContent()
        action = content["action"]
        if action == "stop_code":
            logger.info("Stopping the code from server command")
            blockly_webserver.stop()
        elif action == "upload_code":
            sensors = content["sensors"]
            if isinstance(sensors, list):
                if len(sensors) == 4:
                    blockly_webserver.update_sensors(sensors)
                    logger.info("Updating sensors: " + str(sensors))
                else:
                    logger.error("Unable to update sensors: " + str(sensors))
            elif sensors is not None:
                logger.error("Sensors is not a list: " + str(sensors))
            url = content["url"]
            logger.info("Uploading code from the server command to " + url)
            code = urllib.urlopen(url).read()
            if code:
                if code == Communicator.mostRecentCode:
                    logger.info("Duplicate code upload detected. Ignoring")
                else:
                    logger.info("About to upload code")
                    blockly_webserver.upload_code(code)
                    logger.info("Done uploading code")
                    Communicator.mostRecentCode = code
                blockly_webserver.start()
            else:
                logger.error("Unable to retrieve code from url: " + url)
        else:
            logger.error("Unknown server command: " + action)

    @staticmethod
    def createWebSocket(webSocketName, webSocketAddress, onMessageMethod):
        """ Creates a WebSocket and adds it to the recipient list. """
        logger.debug(">>> Method called: createWebSocket")
        tmp = websocket.WebSocketApp(webSocketAddress,
                                     on_open = Communicator.onOpen,
                                     on_error = Communicator.onError,
                                     on_close = Communicator.onClose,
                                     on_message = onMessageMethod)
        Communicator.recipients[webSocketName] = tmp
        logger.info("Created new WebSocket: " + str(webSocketName))

    @staticmethod
    def startWebSocket(webSocket):
        """
        Creates a
        """
        logger.info('Starting a WebSocket')
        webSocketThread = threading.Thread(target = webSocket.run_forever)
        webSocketThread.daemon = True
        webSocketThread.start()

    @staticmethod
    def initialize():
        """
        Starts the Communicator activities.
        A separate thread is created for each WebSocket.
        """
        logger.debug(">>> Method called: start")
        # Starts a thread for each stored websocket.
        for webSocket in Communicator.recipients.values():
            Communicator.startWebSocket(webSocket)

    @staticmethod
    def startAgent():
        """
        Checks every 10 seconds to see if there are any closed WebSockets and
        reopens them. This makes it possible to disconnect Dax or MP and then
        reconnect them without restarting the CM.
        """
        logger.info("Communicator Agent starting ...")
        while True:
            time.sleep(2)
            logger.debug(">>> Checking the restartQueue ...")
            if Communicator.restartQueue:
                logger.info("Restarting a closed WebSocket ...")
                webSocket = Communicator.restartQueue.popleft()
                Communicator.startWebSocket(webSocket)


    def on_connected(self, connection):
        #print "connected"
        connection.channel(cm.on_channel_open)

    def on_channel_open(self, new_channel):
        global channel
        channel = new_channel
        channel.queue_declare(queue='Message', callback=cm.on_queue_declared)

    def on_queue_declared(self, frame):
        channel.basic_consume(cm.handle_delivery, queue='Message', no_ack=True)

    def handle_delivery(self, channel, method, header, body):
        # command = Message.decode(body)
        # print str(command.getContent())
        Communicator.recipients["DAX"].send(body)

if __name__ == "__main__":
    handler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/comms_module.log',
                                                   maxBytes=8192, backupCount=3)
    globalHandler = logging.handlers.RotatingFileHandler(filename='/home/pi/blockytalky/logs/master.log',
                                                         maxBytes=16384, backupCount=3)
    formatter = logging.Formatter(fmt='%(asctime)s - %(levelname)s: %(message)s',
                                  datefmt='%H:%M:%S %d/%m')
    handler.setFormatter(formatter)
    globalHandler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.addHandler(globalHandler)
    logger.setLevel(logging.INFO)

    logger.info("Communicator Module (WebSocket client) starting ...")

    # DAX WebSocket (remote component)
    Communicator.createWebSocket("DAX",
                                 #"ws://192.168.1.43:8005/dax",
                                 "ws://btrouter.getdown.org:8005/dax",
                                 Communicator.onRemoteMessage)
    Communicator.initialize()
    logger.info("Communicator Module (WebSocket client) started.")

    agentThread = threading.Thread(target=Communicator.startAgent)
    agentThread.start()
    
    cm = Communicator()
    parameters = pika.ConnectionParameters()
    cm.connection = pika.SelectConnection(parameters, cm.on_connected)
    cm.connection.ioloop.start()
    

