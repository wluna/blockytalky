#!/usr/bin/env python
"""
Blocky Talky - Message Passer (mp.py, WebSocket server)

This module is responsible for managing the channel subscriptions and routing
the messages to the appropriate recipients.
"""
import logging               # Doc: http://docs.python.org/2/howto/logging.html
import socket                # Used to get hostname of robot
import tornado.httpserver    # Install via "pip install tornado"
import tornado.websocket     # Doc: http://www.tornadoweb.org/en/stable/
import tornado.ioloop
import tornado.web
from message import *        # The contents will be in the same namespace.

class MessagePasser(tornado.websocket.WebSocketHandler):
    hostname = socket.gethostname()
    # Create the channel subscriber lists based on Message.validChannels.
    # Initially, these are empty lists inside a dictionary.
    channelList = {}
    i = 0
    for channel in Message.validChannels:
        channelList[channel] = []

    def open(self):
        logging.debug(">>> Method called: open")
        logging.info("New connection.")

    def on_message(self, encodedMessage):
        """
        When a JSON encoded message is received it gets decoded and handled
        based on its "channel" field.
        """
        logging.debug(">>> Method called: on_message")
        message = Message.decode(encodedMessage)
        logging.info("Message received.")
        logging.debug(str(message))

        channel = message.getChannel()
        if channel == "Subs":
            self.handshake(message)
        elif channel == "Message":
            if message.getDestination() == self.hostname:
                self.forwardMessage("MsgIn", encodedMessage)
            else:
                self.forwardMessage("MsgOut", encodedMessage)
        else:
            self.forwardMessage(channel, encodedMessage)

    def on_close(self):
        """
        When the connection is closed the websocket is removed from all of the
        channels.
        """
        logging.debug(">>> Method called: on_close")
        for channel in MessagePasser.channelList.values():
            if self in channel:
                channel.remove(self)
        logging.info("Connection closed.")

    def handshake(self, message):
        """
        This method handles the subscription requests. (channel = "Subs")
        """
        logging.debug(">>> Method called: handshake")
        # Look at the list of requested channels and subscribe to them.
        for requestedChannel in message.getContent():
            MessagePasser.channelList[requestedChannel].append(self)
            logging.info(str(message.getSource()) + " added to channel: "
                + requestedChannel)

    def forwardMessage(self, channel, encodedMessage):
        """
        This method takes care of all the messages that aren't subscription
        requests. These are forwarded to the appropriate channels.
        """
        logging.debug(">>> Method called: forwardMessage")
        for recipient in MessagePasser.channelList[channel]:
            recipient.write_message(encodedMessage)
            logging.info("Forwarded a message to channel: " + channel)
            
application = tornado.web.Application([
    (r'/mp', MessagePasser),
])

if __name__ == "__main__":
        # Set the logging level.
        logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                            # filename = "mp.log",
                            level = logging.ERROR)
        logging.info("Message Passer (WebSocket server) starting ...")
        # Start the server.
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(8886)
        tornado.ioloop.IOLoop.instance().start()
