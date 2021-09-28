
console.log("Background setup");

let rig_configuration = {
    "name": "FT-891",
    "type": "rigctld",
    "config": {
        "host": "localhost",
        "port": 4532
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Control request: ");
        request.rig = rig_configuration;
        console.log(request);

        try {
            chrome.runtime.sendNativeMessage('com.skyironstudio.rigctld_native_messaging_host',
                request,
                function (response) {
                    console.log("Received");
                    console.log(response);
                });
        } catch(e) {
            console.log(e);
        }

      return true;
    }
);
