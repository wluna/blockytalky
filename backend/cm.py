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
from collections import deque
from message import *

class Communicator(object):
    hostname = socket.gethostname()     # Sender specific constant
    recipients = {}                     # Filled by "createWebSocket"
    restartQueue = deque()
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.queue_declare(queue="HwCmd")


    @staticmethod
    def onOpen(ws):
        logging.debug(">>> Method called: onOpen")
        # if Communicator.recipients["MP"] == ws:
        #     logging.info("Connection opened: MP")
        #     msg = Message(Communicator.hostname, "mp", "Subs",("MsgOut",))
        #     msg = Message.encode(msg)
        # else:
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
    def onLocalMessage(ws, encodedMessage):
        """ This method handles messages coming from the Pi. """
        logging.debug(">>> Method called: onLocalMessage")
        if "DAX" in Communicator.recipients.keys():
            Communicator.recipients["DAX"].send(encodedMessage)
        else:
            raise WebSocketException("DAX WebSocket address is unknown!")
        logging.info("Local message received. Forwarded it to: DAX (remote)")

    @staticmethod
    def onRemoteMessage(ws, encodedMessage):
        """ This method handles messages coming from DAX. """
        logging.debug(">>> Method called: onRemoteMessage")
        channel.basic_publish(exchange='', routing_key='HwVal', body=encodedMessage)
        # if "MP" in Communicator.recipients.keys():
            # Communicator.recipients["MP"].send(encodedMessage)
        # else:
        #     raise WebSocketException("MP WebSocket address is unknown!")
        logging.info("Remote message received. Forwarded locally")

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

if __name__ == "__main__":
    # Set the logging level and start the client.
    logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                        # filename = "cm.log",
                        level = logging.DEBUG)
    logging.info("Communicator Module (WebSocket client) starting ...")
    # MP WebSocket (local component)
    # Communicator.createWebSocket("MP",
    #                              "ws://localhost:8886/mp",
    #                              Communicator.onLocalMessage)

    # DAX WebSocket (remote component)
    Communicator.createWebSocket("DAX",
                                 "ws://btconnect.dax.getdown.org/dax",
                                  # "ws://25.193.190.132:8887/dax",
                                 Communicator.onRemoteMessage)
    Communicator.initialize()
    logging.info("Communicator Module (WebSocket client) started.")
    Communicator.startAgent()
