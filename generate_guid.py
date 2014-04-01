#!/usr/bin/python
import os
import binascii
import sys

#Don't use O so that it isn't confused with 0
numerals35 = "0123456789abcdefghijklmnpqrstuvwxyz"
numerals36 = "0123456789abcdefghijklmnopqrstuvwxyz" 

base = len(numerals36)

#Yes, this is linear search, but n is very small and this doesn't get called too often
def valueOfCharacter(c):
    return numerals36.index(c)

#Source: http://stackoverflow.com/questions/2267362/convert-integer-to-a-string-in-a-given-numeric-base-in-python
def baseN(num,b, numerals):
    return ((num == 0) and numerals[0]) or (baseN(num // b, b, numerals).lstrip(numerals[0]) + numerals[num % b])

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
        checksum += sum(digits_of(baseN(d*2, base, numerals36)))
    return checksum % base
 
def is_luhn_valid(card_number):
    return luhn_checksum(card_number) == 0

def calculate_luhn(partial_card_number):
    check_digit = luhn_checksum(partial_card_number + numerals36[0])
    return check_digit if check_digit == 0 else base - check_digit

def generate_guid():
    randomBytes = baseN(int(binascii.hexlify(os.urandom(8)), 16), base - 1, numerals35)
    checkDigit = numerals36[calculate_luhn(randomBytes)]
    randomBytes += checkDigit
    #The checkDigit could be a O, so redo the process.
    if checkDigit == 'o':
        return generate_guid()
    else:
        return randomBytes

if __name__ == '__main__':
    guid = generate_guid()
    sys.stdout.write(guid.upper())

