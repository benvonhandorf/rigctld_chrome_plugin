
console.log("Background setup");

var rigs = [
    {
        "name": "FT-891",
        "type": "rigctld",
        "config": {
            "host": "localhost",
            "port": 4532
        }
    },{
        "name": "Gqrx",
        "type": "gqrx",
        "config": {
            "host": "localhost",
            "port": 7356
        }
    }
]

var rig_configuration = rigs[0];

var spots_by_program = {};

let handle_control_request = (request) => {
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
}

let handle_spots_data = (request) => {
    console.log("Spot data: ");
    spots_by_program[request.program] = request;

    console.log(spots_by_program);
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.type == "control") {
            handle_control_request(request);
        } else if(request.type == "spots") {
            handle_spots_data(request);
        }

      return true;
    }
);
