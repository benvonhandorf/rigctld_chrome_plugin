#!./env/bin/python3

import sys
import struct
import json
from rigctld_connection import RigctldConnection
from gqrx_connection import GqrxConnection
from pushover_api import PushoverApi

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

def send_alerts_notification(notify_alerts_message, log_file):
    alerts = message.get("alerts") or []

    field_separator = ","
    alert_separator = " and "

    message_body = ""

    for alert in alerts:
        alert_text = ""

        alert_fields = alert.get("alert_fields") or []

        for alert_field in alert_fields:
            value = alert.get(alert_field) or ""

            if value:
                alert_text = alert_text + value + field_separator
        
        if alert_text:
            message_body = message_body + alert_text[:-len(field_separator)] + alert_separator
        
    if message_body:
        message_body = message_body[:-len(alert_separator)]

        log_file.write("Notification body:")
        log_file.write(message_body)
        log_file.write("\n")

        try:
            push_configuration = {}

            with open("push_notification_settings.json") as settings_file:
                push_configuration = json.load(settings_file) or {}

            log_file.write(str(push_configuration))
            log_file.write("\n")

            push_providers = push_configuration.get("providers") or []

            for provider in push_providers:
                api = None

                if provider["api"] == "pushover":
                    api = PushoverApi(provider)

                if api:
                    log_file.write(f"Found push configuration for {provider['api']}")
                    log_file.write("\n")

                    api.send_notification(message_body)
        except Exception as e:
            log_file.write(f"Exception: {e}\n")

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
        elif message["type"] == "alerts":
            send_alerts_notification(message, log)

            result = {"result":"success"}

            log.write(f'Alert result: {result}')

            send_message(result)
        elif message["type"] == "ping":
            log.write("Ping received\n")
            result = {"result": "pong", "version": "1.0.0"}
            send_message(result)
        else:
            log.write("Unknown message type\n")


while True:
    try:
        message = get_message()

        process_message(message)
    except Exception as e:
        with open("info.log", "a") as log:
            log.write(str(e))
            log.write('\n')
