#!./env/bin/python3

import sys
import struct
import json
from rigctld_connection import RigctldConnection
from gqrx_connection import GqrxConnection

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

def ssb_mode_from_frequency(frequency):
    if frequency > 10000000:
        return "USB"
    else:
        return "LSB"

mode_lookup = {
    "FT8": {"mode": lambda frequency: "PKTUSB", "passband": 3000},
    "CW": {"mode": lambda frequency: "CWU", "passband": 500},
    "SSB": {"mode": ssb_mode_from_frequency, "passband": 2600},
}

def get_rig_connection(rig_info):
    rig_config = rig_info["config"]

    if rig_info["type"] == "rigctrld":
        rig_connection = RigctldConnection(rig_config["host"], rig_config["port"])
    else:
        rig_connection = GqrxConnection(rig_config["host"], rig_config["port"])

    return rig_connection

def process_message(message):
    with open("info.log", "a") as log:
        log.write(json.dumps(message, sort_keys=True, indent=4))
        log.write('\n')

        rig_connection = get_rig_connection(message["rig"])

        frequency = message["frequency"]
        raw_mode = message["mode"].upper()

        mapped_mode = mode_lookup.get(raw_mode)

        mode_string = mapped_mode["mode"](frequency)
        passband = mapped_mode["passband"]
    
        rig_connection.connect()

        # Mode gets set first so that the frequency is set properly when switching
        # to/from CW
        result = rig_connection.set_mode(mode_string, passband)
        log.write(f'rigctld: {mode_string} {passband} {result}')

        result = rig_connection.set_frequency(frequency)
        log.write(f'rigctld: {frequency} {result}')

        result = rig_connection.get_radio_state()

        rig_connection.disconnect()

        send_message(result)

while True:
    message = get_message()
#     message = json.loads("""{
#     "frequency": 14295000,
#     "mode": "SSB",
#     "rig": {
#         "name": "Gqrx",
#         "type": "gqrx",
#         "config": {
#             "host": "localhost",
#             "port": 7356
#         }
#     }
# }""")

    process_message(message)