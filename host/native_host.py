#!./env/bin/python3

import sys
import struct
import json
from rigctld_connection import RigctldConnection

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
    "CW": {"mode": lambda frequency: "CW", "passband": 500},
    "SSB": {"mode": ssb_mode_from_frequency, "passband": 3000},
}

def process_message(message):
    with open("info.log", "a") as log:
        log.write(json.dumps(message, sort_keys=True, indent=4))
        log.write('\n')

        if message["rig"]["type"] == "rigctld":
            rig_config = message["rig"]["config"]

            log.write(f'rigctld: {rig_config["host"]} {rig_config["port"]}')

            frequency = message["frequency"]
            raw_mode = message["mode"].upper()

            mapped_mode = mode_lookup.get(raw_mode)

            mode_string = mapped_mode["mode"](frequency)
            passband = mapped_mode["passband"]

            log.write(f'Setting {frequency} {mode_string} {passband}')
            
            rig_connection = RigctldConnection(rig_config["host"], rig_config["port"])
            rig_connection.connect()

            rig_connection.set_frequency(frequency)
            rig_connection.set_mode(mode_string, passband)

            result = rig_connection.get_radio_state()

            rig_connection.disconnect()

            send_message(result)
        else:
            send_message({"nack": False})

while True:
    message = get_message()
#     message = json.loads("""{
#     "frequency": 14295000,
#     "mode": "SSB",
#     "rig": {
#         "name": "FT-891",
#         "type": "rigctld",
#         "config": {
#             "host": "localhost",
#             "port": 4532
#         }
#     }
# }""")

    process_message(message)