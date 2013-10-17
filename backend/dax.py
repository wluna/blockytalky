#!/usr/bin/env python
"""
Blocky Talky - dax (dax.py, WebSocket server)

The Python script running on dax. Acts as an intermediary between a service
(eg. Facebook) and a BrickPi or between communicating BrickPis.
"""
import logging
import tornado.httpserver    # Install via "pip install tornado"
import tornado.websocket     # Doc: http://www.tornadoweb.org/en/stable/
import tornado.ioloop
import tornado.web
from message import *

class DaxRouter(tornado.websocket.WebSocketHandler):
    bots = {}

    def open(self):
        print self
        logging.debug(">>> Method called: open")
        logging.info("New connection.")

    def on_message(self, encodedMessage):
        print self
    logging.debug(">>> Method called: on_message")
        logging.debug(str(self.bots))
    message = Message.decode(encodedMessage)
        destination = message.getDestination()
        if destination == "dax":
            # Register into Dax's "database".
        print self
            DaxRouter.bots[message.getSource()] = self
        else:
            try:
                # Forward it to the final destination.
                DaxRouter.bots[destination].write_message(encodedMessage)
                logging.debug(destination)
        except NameError:
                logging.error("Message destination not available: " +
                              str(destination))

    def on_close(self):
        logging.debug(">>> Method called: on_close")
        conn = "Unknown"
        for name, webSocket in DaxRouter.bots.items():
            if webSocket == self:
                del DaxRouter.bots[name]
                conn = name
        logging.info("Connection closed with: " + conn)

application = tornado.web.Application([
    (r'/dax', DaxRouter),
])

if __name__ == "__main__":
        # Set the logging level.
        logging.basicConfig(format = "%(levelname)s:\t%(message)s",
                            # filename = "dax.log",
                            level = logging.DEBUG)
        # Start the server.
        logging.info("Dax Router (WebSocket server) starting ...")
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(8005)
        tornado.ioloop.IOLoop.instance().start()
