import http.client, urllib

class PushoverApi():
    def __init__(self, configuration):
        self.token = configuration["token"]
        self.user_key = configuration["user_key"]

    def send_notification(self, message):
        conn = http.client.HTTPSConnection("api.pushover.net:443")
        conn.request("POST", "/1/messages.json",
        urllib.parse.urlencode({
            "token": self.token,
            "user": self.user_key,
            "message": message,
        }), { "Content-type": "application/x-www-form-urlencoded" })

        conn.getresponse()