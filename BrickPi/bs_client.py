import socket
import sys

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
    
def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) == 3:
        HOST = argv[1]
        PORT = argv[2]
        connect(PORT, HOST)
    else:
        connect()

def tryagain():
    try:
        HOST = raw_input("Type in a new host:")
        PORT = raw_input("Type in a new port:")
    except EOFError:
        print ''
        exit()

    if is_number(PORT):
        connect(HOST, PORT)
    else:
        print "PORT value: '" + str(PORT) + "' is not a valid number"
        tryagain()

# Create a socket (SOCK_STREAM means a TCP socket)
def connect(HOST='127.0.0.1', PORT='9999'):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    data = ''
    received = '1'
    print "Connecting to " + HOST + ":" + PORT
    
    try:
        # Connect to server and send data
        sock.connect((HOST, int(PORT)))

        while bool(received):
            data = raw_input("message:")
            sock.sendall(data)
            # Receive data from the server and shut down
            received = sock.recv(1024)
            print "Sent:     {}".format(data)
            print "Received: {}".format(received)

    except socket.error as err:
        #Catch connection errors
        print str(err)
        tryagain()

    finally:
        sock.close()

if __name__ == "__main__":
    main()

