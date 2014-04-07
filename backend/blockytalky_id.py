#!/usr/bin/env python

_BlockyTalkyID = None

def BlockyTalkyID():
    global _BlockyTalkyID
    if _BlockyTalkyID is None:
        f = open("/etc/BlockyTalkyID", 'r')
        _BlockyTalkyID = f.read()
        f.close()
    return _BlockyTalkyID

if __name__ == '__main__':
    print BlockyTalkyID()

