#!/usr/bin/python
import os
import binascii
import sys

def valueOfCharacter(c):
    return int(float.fromhex(c))

#http://en.wikipedia.org/wiki/Luhn_algorithm
def luhn_checksum(card_number):
    def digits_of(n):
        return [valueOfCharacter(d) for d in str(n)]
    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = 0
    checksum += sum(odd_digits)
    for d in even_digits:
        checksum += sum(digits_of(hex(d*2)[2:]))
    return checksum % 16
 
def is_luhn_valid(card_number):
    return luhn_checksum(card_number) == 0

def calculate_luhn(partial_card_number):
    check_digit = luhn_checksum(partial_card_number + '0')
    return check_digit if check_digit == 0 else 16 - check_digit

randomBytes = binascii.hexlify(os.urandom(16))
checkDigit = hex(calculate_luhn(randomBytes))[2:] #Get rid of 0x at the beginning
randomBytes += checkDigit
sys.stdout.write(randomBytes.upper())

