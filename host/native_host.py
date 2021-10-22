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

def get_rig_connection(rig_info):
    rig_config = rig_info["config"]

    if rig_info["type"] == "rigctld":
        rig_connection = RigctldConnection(rig_config["host"], rig_config["port"])
    else:
        rig_connection = GqrxConnection(rig_config["host"], rig_config["port"])

    return rig_connection

def process_message(message):
    with open("info.log", "a") as log:
        log.write(json.dumps(message, sort_keys=True, indent=4))
        log.write('\n')

        if message["type"] == "control":

            log.write(f'preparing connection\n')

            try:
                rig_connection = get_rig_connection(message["rig"])
            except Exception as err:
                log.write(f'Error creating connection: {err}\n')
                return

            log.write(f'connection prepared - {type(rig_connection)}\n')

            spot = message["spot"]

            frequency = spot["frequency"]
            raw_mode = spot["mode"].upper()

            [mode_string, passband] = rig_connection.mode_passband_lookup(raw_mode, frequency)

            log.write(f'parsed: {frequency} {raw_mode}->{mode_string} {passband}\n')
        
            rig_connection.connect()

            # Mode gets set first so that the frequency is set properly when switching
            # to/from CW
            result = rig_connection.set_mode(mode_string, passband)
            log.write(f'rigctld: {mode_string} {passband} {result}\n')

            result = rig_connection.set_frequency(frequency)
            log.write(f'rigctld: {frequency} {result}\n')

            result = rig_connection.get_radio_state()

            log.write(f'Radio State: {result}')

            rig_connection.disconnect()

            send_message(result)
        else:
            log.write("Unknown message type\n")


while True:
    message = get_message()
#     message = json.loads("""{
#     "rig": {
#         "config": {
#             "host": "localhost",
#             "port": 7356
#         },
#         "name": "Gqrx",
#         "type": "gqrx"
#     },
#     "spot": {
#         "callsign": "KE0DSD",
#         "frequency": 21300000,
#         "location": "US-CO",
#         "mode": "SSB",
#         "unit": "K-0227"
#     },
#     "type": "control"
# }""")

    process_message(message)