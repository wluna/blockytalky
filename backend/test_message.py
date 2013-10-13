#!/usr/bin/env python
"""
Blocky Talky - unit tests for message.py

The setUp method is executed before each test.
Methods starting with test_ are executed one by one.
"""
import unittest, copy
from message import *

class TestSequenceFunctions(unittest.TestCase):
    # This setup sequence is executed before each test.
    def setUp(self):
        self.testSource = "TestSource"
        self.testDestination = "Wolverine"
        self.testChannel = "Subs"
        self.testContent = ("HwVal", "FB")
        self.msg = Message(self.testSource, self.testDestination,
                           self.testChannel, self.testContent)

    # Test to see if the initialization was correct and getters work.
    def test_getters(self):
        self.assertEqual(self.msg.getSource(), self.testSource)
        self.assertEqual(self.msg.getDestination(), self.testDestination)
        self.assertEqual(self.msg.getChannel(), self.testChannel)
        self.assertEqual(self.msg.getContent(), self.testContent)

    # Test to see if the __eq__() function works correctly.
    def test_equals(self):
        msgCopy = copy.deepcopy(self.msg)
        self.assertTrue(self.msg == msgCopy)
        self.assertTrue(Message.encode(self.msg) == Message.encode(msgCopy))

    # Test to see if invalid initialization arguments cause an exception.
    def test_exception(self):
        invalidChannel = "la Manche"
        self.assertRaises(TypeError, Message, self.testSource, invalidChannel)

    # Test to see if encoding identical copies leads to the same results.
    def test_encoding(self):
        msgCopy = copy.deepcopy(self.msg)
        self.assertEqual(Message.encode(self.msg), Message.encode(msgCopy))

    # Test to see if encoding then decoding gives back the original message.
    def test_decoding(self):
        encodedMsg = Message.encode(self.msg)
        self.assertEqual(self.msg, Message.decode(encodedMsg))

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSequenceFunctions)
    unittest.TextTestRunner(verbosity=2).run(suite)