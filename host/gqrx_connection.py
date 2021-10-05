import socket
import re

class GqrxConnection:
    def __init__(self, host = "localhost", port = 7356):
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

    def parse_response(self, response, expected_lines):
        match = self.response_parser.search(response)
        
        if match is not None:
            return int(match.group("CODE")[0] or -1000)
        elif expected_lines != -1 and response.count('\n') == expected_lines:
            return 0
        else:
            return -1000

    def receive_response(self, expected_lines):
        chunks = []
        bytes_recd = 0
        while bytes_recd < self.max_message_length:
            chunk = self.sock.recv(min(self.max_message_length - bytes_recd, self.max_message_length))
            if chunk == b'':
                raise RuntimeError("socket connection broken")
            
            chunks.append(chunk)
            bytes_recd = bytes_recd + len(chunk)

            if self.parse_response(b''.join(chunks).decode('utf-8'), expected_lines) != -1000:
                break

        return b''.join(chunks).decode('utf-8')

    def send_command(self, command, expected_lines):
        if not command.endswith('\n'):
            command = command + '\n'

        total_sent = 0

        command = command.encode('utf-8')

        while total_sent < len(command):
            sent = self.sock.send(command[total_sent:])
            if sent == 0:
                raise RuntimeError("socket connection broken")
            total_sent = total_sent + sent

        response = self.receive_response(expected_lines)

        return response

    def parse_response_into_result(self, response, response_line_types):
        response_lines = response.split('\n')
        
        result = {"response_code": 0}

        for line_number, line in enumerate(response_lines):
            if not line:
                continue
            
            try:
                result[response_line_types[line_number]] = float(line)
            except(ValueError):
                try:
                    result[response_line_types[line_number]] = int(line)
                except(ValueError):
                    result[response_line_types[line_number]] = line

        return result


    def set_frequency(self, hz):
        command = f"F {hz}"

        response = self.send_command(command, -1)

        result = {}

        return result

    def get_frequency(self):
        command = f"f"

        response = self.send_command(command, 1)

        result = self.parse_response_into_result(response, ["frequency"])

        return result

    def set_mode(self, mode, passband_hz):
        command = f"M {mode} {passband_hz}"

        response = self.send_command(command, -1)

        result = {}

        return result

    def get_mode(self):
        command = f"m"

        response = self.send_command(command, 2)

        result = self.parse_response_into_result(response, ["mode", "passband"])

        return result

    def get_radio_state(self):
        result = self.get_frequency()
        result.update(self.get_mode())

        return result