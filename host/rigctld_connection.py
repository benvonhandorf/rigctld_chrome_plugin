import socket
import re

class RigctldConnection:
    def __init__(self, host = "localhost", port = 4532):
        self.host = host
        self.port = port

        self.max_message_length = 1024

        self.response_parser = re.compile("RPRT (?P<CODE>[-+]?\d+)\n")

        self.mode_parser = re.compile("Mode: (?P<VALUE>\w+)\n")
        self.passband_parser = re.compile("Passband: (?P<VALUE>\w+)\n")
        self.frequency_parser = re.compile("Frequency: (?P<VALUE>\d+)\n")
        self.level_parser = re.compile("(?P<VALUE>[+-]?\d+\.?\d*)\n")
        self.power_parser = re.compile("Power mW: (?P<VALUE>[+-]?\d+\.?\d*)\n")

        self.sock = None

    def connect(self):
        if self.sock is None:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        self.sock.connect((self.host, self.port))

    def disconnect(self):
        if self.sock is not None:
            self.sock.close()
            self.sock = None

    def parse_response(self, response):
        match = self.response_parser.search(response)
        
        if match is not None:
            return int(match.group("CODE")[0] or -1000)
        else:
            return -1000

    def receive_response(self):
        chunks = []
        bytes_recd = 0
        while bytes_recd < self.max_message_length:
            chunk = self.sock.recv(min(self.max_message_length - bytes_recd, self.max_message_length))
            if chunk == b'':
                raise RuntimeError("socket connection broken")
            
            chunks.append(chunk)
            bytes_recd = bytes_recd + len(chunk)

            if self.parse_response(b''.join(chunks).decode('utf-8')) != -1000:
                break

        return b''.join(chunks).decode('utf-8')

    def send_command(self, command):
        if not command.endswith('\n'):
            command = command + '\n'

        total_sent = 0

        command = command.encode('utf-8')

        while total_sent < len(command):
            sent = self.sock.send(command[total_sent:])
            if sent == 0:
                raise RuntimeError("socket connection broken")
            total_sent = total_sent + sent

        response = self.receive_response()

        return response

    def parse_response_into_result(self, response, level_type = None):
        response_code = self.parse_response(response)

        result = {"response_code": response_code}

        if response_code == 0:
            frequency_match = self.frequency_parser.search(response)

            if frequency_match:
                result["frequency"] = int(frequency_match.groups("VALUE")[0])

            mode_match = self.mode_parser.search(response)

            if mode_match:
                result["mode"] = mode_match.groups("VALUE")[0]

            passband_match = self.passband_parser.search(response)

            if passband_match:
                result["passband"] = int(passband_match.groups("VALUE")[0])

            if level_type:
                level_match = self.level_parser.search(response)

                if level_match:
                    result[level_type] = float(level_match.groups("VALUE")[0])

            power_match = self.power_parser.search(response)

            if power_match:
                result["power_mw"] = float(power_match.groups("VALUE")[0])

        return result


    def set_frequency(self, hz):
        command = f"+\\set_freq {hz}"

        response = self.send_command(command)

        result = self.parse_response_into_result(response)

        return result

    def get_frequency(self):
        command = f"+\\get_freq"

        response = self.send_command(command)

        result = self.parse_response_into_result(response)

        return result

    def set_mode(self, mode, passband_hz):
        command = f"+\\set_mode {mode} {passband_hz}"

        response = self.send_command(command)

        result = self.parse_response_into_result(response)

        return result

    def get_mode(self):
        command = f"+\\get_mode"

        response = self.send_command(command)

        result = self.parse_response_into_result(response)

        return result

    def get_power(self, frequency, mode):
        command = f"+\\get_level RFPOWER"

        response = self.send_command(command)

        result = self.parse_response_into_result(response, "power_level")

        command = f"+\\power2mW {result['power_level']} {frequency} {mode}"

        response = self.send_command(command)

        result.update(self.parse_response_into_result(response))

        return result

    def get_radio_state(self):
        result = self.get_frequency()
        result.update(self.get_mode())
        result.update(self.get_power(result["frequency"], result["mode"]))

        return result

    def ssb_mode_from_frequency(frequency):
        if frequency > 10000000:
            return "USB"
        else:
            return "LSB"

    mode_lookup = {
        "FT8": {"mode": lambda frequency: "PKTUSB", "passband": 3000},
        "CW": {"mode": lambda frequency: "CW", "passband": 500},
        "SSB": {"mode": ssb_mode_from_frequency, "passband": 2600},
    }

    def mode_passband_lookup(self, raw_mode, frequency):
        mapped_mode = RigctldConnection.mode_lookup.get(raw_mode)

        mode_string = mapped_mode["mode"](frequency)
        passband = mapped_mode["passband"]

        return [mode_string, passband]