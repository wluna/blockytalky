import SocketServer
import botspeak

class BotSpeakTCPHandler(SocketServer.BaseRequestHandler):
    """
    The RequestHandler class for our server.

    It is instantiated once per connection to the server, and must
    override the handle() method to implement communication to the
    client.
    """
    def handle(self):
        self.data = ''
        while 1:
            # self.request is the TCP socket connected to the client
            self.data = self.request.recv(1024).strip()
           
            #print out the command
            print "{} wrote:".format(self.client_address[0])
            print self.data

            #check for the terminating case
            if self.data == '\\r\\n':
                print 'Recieved terminating condition \\r\\n.'
                self.request.sendall('')
                break
            
            #check for a valid command
            packetData = self.data
            val = botspeak.parseInput(packetData)
            val = val + '\r\n'
            self.request.sendall(val)
            # just send back the same data, but upper-cased
            # self.request.sendall(self.data)

if __name__ == "__main__":
    HOST, PORT = '', 9999

    print 'Starting Botspeak TCP server...'

    #initialize botspeak
    botspeak.init_pins();

    # Create the server, binding to localhost on port 9999
    server = SocketServer.TCPServer((HOST, PORT), BotSpeakTCPHandler)
    server.allow_reuse_address = True

    print 'Botspeak server initiated'
    print 'Listening on port:' + str(PORT)
    
    # Activate the server; this will keep running until you
    # interrupt the program with Ctrl-C
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
        server.socket.close()
        print "Quiting botspeak server"

