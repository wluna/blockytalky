from message import *
from websocket import *

ws= create_connection("ws://localhost:8886/mp")
toSend= Message("killa", None, "HwCmd", Message.createImage(motor1=0, motor2=0, motor3=0, motor4=0, led1=0, led2=0))
ws.send(Message.encode(toSend))
print "sent"
