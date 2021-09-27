#!./env/bin/python3

import sys
import struct
import json

## Largely gleaned/copied/inspired from: https://github.com/SphinxKnight/webextensions-examples/blob/master/native-messaging/app/ping_pong.py

def get_message():
    rawLength = sys.stdin.buffer.read(4)

    if len(rawLength) == 0:
        sys.exit(0)

    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)

# Encode a message for transmission,
# given its content.
def encode_message(messageContent):
    encodedContent = json.dumps(messageContent).encode('utf-8')
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

def send_message(response):
    encoded_message = encode_message(response)

    sys.stdout.buffer.write(encoded_message['length'])
    sys.stdout.buffer.write(encoded_message['content'])
    sys.stdout.buffer.flush()

def process_message(message):
    with open("info.log", "a") as f:
        f.write(json.dumps(message, sort_keys=True, indent=4))
        f.write('\n')

    send_message({"ack": True})

while True:
    message = get_message()
    process_message(message)