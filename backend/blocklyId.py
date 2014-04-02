#!/usr/bin/env python

_blocklyId = None

def blocklyId():
    global _blocklyId
    if _blocklyId is None:
        f = open("/etc/blocklyId", 'r')
        _blocklyId = f.read()
        f.close()
    return _blocklyId

if __name__ == '__main__':
    print blocklyId()

