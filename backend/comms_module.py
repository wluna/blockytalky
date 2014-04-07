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
from blocklyId import *
from message import *

class Communicator(object):
    hostname = blocklyId()
    recipients = {}                     # Filled by "createWebSocket"
    restartQueue = deque()
    global channelOut
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channelOut = connection.channel()
    channelOut.queue_declare(queue="HwVal")

    mostRecentCode = None

    @staticmethod
    def onOpen(ws):
        logging.debug(">>> Method called: onOpen")
        logging.info("Connection opened: DAX")
        msg = Message(Communicator.hostname, "dax", "Subs", ())
        msg = Message.encode(msg)
        ws.send(msg)

    @staticmethod
    def onError(ws, error):
        logging.error("A WebSocket error has occured.")

    @staticmethod
    def onClose(ws):
        logging.debug(">>> Method called: onClose")
        logging.info("Connection closed.")
        Communicator.restartQueue.append(ws)

    @staticmethod    
    def onRemoteMessage(ws, encodedMessage):
        """ This method handles messages coming from DAX. """
        logging.debug(">>> Method called: onRemoteMessage")
        logging.info("Remote message received. Forwarded locally")
        logging.info(encodedMessage)
        decoded = Message.decode(encodedMessage)
        if decoded.getChannel() == "Server":
            logging.info("Received server command")
            Communicator.respondToServerMessage(decoded)
        else:
            channelOut.basic_publish(exchange="", routing_key="HwVal", body=encodedMessage)

    #Respond to a command originating from the main server (rails, not dax)
    @staticmethod
    def respondToServerMessage(message):
        content = message.getContent()
        action = content["action"]
        if action == "stop_code":
            logging.info("Stopping the code from server command")
            blockly_webserver.stop()
        elif action == "upload_code":
            url = content["url"]
            logging.info("Uploading code from the server command to " + url)
            code = urllib.urlopen(url).read()
            if code:
                if code == Communicator.mostRecentCode:
                    logging.info("Duplicate code upload detected. Ignoring")
                    print "Duplicate: "
                    print code
                else:
                    print "Upload: "
                    print code
                    logging.info("About to upload code")
                    blockly_webserver.upload_code(code)
                    logging.info("Done uploading code")
                    Communicator.mostRecentCode = code
                blockly_webserver.start()
            else:
                logging.error("Unable to retrieve code from url: " + url)
        else:
            logging.error("Unknown server command: " + action)

    @staticmethod
    def createWebSocket(webSocketName, webSocketAddress, onMessageMethod):
        """ Creates a WebSocket and adds it to the recipient list. """
        logging.debug(">>> Method called: createWebSocket")
        tmp = websocket.WebSocketApp(webSocketAddress,
                                     on_open = Communicator.onOpen,
                                     on_error = Communicator.onError,
                                     on_close = Communicator.onClose,
                                     on_message = onMessageMethod)
        Communicator.recipients[webSocketName] = tmp
        logging.info("Created new WebSocket: " + str(webSocketName))

    @staticmethod
    def startWebSocket(webSocket):
        """
        Creates a
        """
        webSocketThread = threading.Thread(target = webSocket.run_forever)
        webSocketThread.daemon = True
        webSocketThread.start()

    @staticmethod
    def initialize():
        """
        Starts the Communicator activities.
        A separate thread is created for each WebSocket.
        """
        logging.debug(">>> Method called: start")
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
        logging.info("Communicator Agent starting ...")
        while True:
            time.sleep(10)
            logging.debug(">>> Checking the restartQueue ...")
            if Communicator.restartQueue:
                logging.info("Restarting a closed WebSocket ...")
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
    # Set the logging level and start the client.
    logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                        filename = "/home/pi/cm.log",
                        level = logging.INFO)
    logging.info("Communicator Module (WebSocket client) starting ...")

    # DAX WebSocket (remote component)
    Communicator.createWebSocket("DAX",
                                 "ws://btrouter.getdown.org:8005/dax",
                                 #"ws://130.64.134.179:8005/dax",
                                 Communicator.onRemoteMessage)
    Communicator.initialize()
    logging.info("Communicator Module (WebSocket client) started.")
    #Communicator.startAgent()
    
    cm = Communicator()
    parameters = pika.ConnectionParameters()
    cm.connection = pika.SelectConnection(parameters, cm.on_connected)
    cm.connection.ioloop.start()
    

