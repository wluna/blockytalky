#!/usr/bin/env python
"""
Blocky Talky - Logging Module (lm.py, WebSocket client)

This module logs data of the user's actions
"""

import time
import threading
import logging
import socket
import datetime
import websocket           # Install via "pip install websocket-client"
from message import *
from blockytalky_id import *

class LoggingModule(object):
    def __init__(self):
        self.hostname = BlockyTalkyID()
        self.robot = Message.initStatus()
        # Startup message to subscribe to Logging channel.
        self.handshake = Message(self.hostname, None, "Subs", ("Logging",))
        self.handshake = Message.encode(self.handshake)

    def onOpen(self, ws):
        logging.info("Connection opened.")
        ws.send(self.handshake)

    def onError(self, ws, error):
        logging.error("A WebSocket error has occured.")

    def onMessage(self, ws, message):
        logging.debug("Message received")
        current_time = datetime.datetime.now().time()
        current_time.isoformat()
        

    def onClose(self, ws):
        logging.info("Connection closed.")

if __name__ == "__main__":
    # Set the logging level.
    logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                        # filename = "lm.log",
                        level = logging.DEBUG)
    lm = LoggingModule()
    ws = websocket.WebSocketApp("ws://localhost:8886/mp",
                                on_open = lm.onOpen,
                                on_message = lm.onMessage,
                                on_error = lm.onError,
                                on_close = lm.onClose)
    ws.run_forever()
