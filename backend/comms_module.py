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
    mostRecentCode = None

    def __init__(self):
        self.msgin_channel = None
        self.msgout_channel = None

        parameters = pika.ConnectionParameters(host='localhost')
        self.connection = pika.BlockingConnection(parameters)

        self.setup_msgin_channel()
        self.setup_msgout_channel()


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
        logger.info(encodedMessage)
        decoded = Message.decode(encodedMessage)
        if decoded.getChannel() == "Server":
            logger.info("Received server command")
            Communicator.respondToServerMessage(decoded)
        else:
            cm.msgin_channel.basic_publish(exchange="msgin", routing_key = "", body=encodedMessage)
            #logger.info("outside message sent to user script")
    
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

    def start(self):
        try:
            self.msgout_channel.start_consuming()
        except pika.exceptions.ConnectionClosed:
            logger.info("pika connection closed")

    def setup_msgin_channel(self):
        self.msgin_channel = self.connection.channel()
        self.msgin_channel.exchange_declare(exchange='msgin', type='fanout')
    

    def setup_msgout_channel(self):
        self.msgout_channel = self.connection.channel()
        self.msgout_channel.exchange_declare(exchange='msgout', type='fanout')
        result = self.msgout_channel.queue_declare(exclusive=True)
        queue_name = result.method.queue
        self.msgout_channel.queue_bind(exchange='msgout', queue=queue_name)
        logger.info("Declaring HwVal callback...")
        self.msgout_channel.basic_consume(self.handle_msgout_delivery, queue=queue_name, no_ack=True)
    

    def handle_msgout_delivery(self, channel, method, header, body):
        self.recipients["DAX"].send(body)
        logger.info("sent message from unit to dax")
        

if __name__ == "__main__":
    logging.basicConfig()
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
    
    cm = Communicator()
   
    
    # DAX WebSocket (remote component)
    cm.createWebSocket("DAX",
                       #"ws://192.168.1.43:8005/dax",
                       # "ws://btrouter.getdown.org:8005/dax",
                       "ws://192.168.1.50:8005/dax",
                       Communicator.onRemoteMessage)
    cm.initialize()
    logger.info("Communicator Module (WebSocket client) started.")

    agentThread = threading.Thread(target=cm.startAgent)
    agentThread.start()
   
    cm.start()

