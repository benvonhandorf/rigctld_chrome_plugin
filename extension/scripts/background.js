
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

var rig_configurations = [rigs[1]];

var spots_by_program = {};

var spots_to_alert = [];

var alerts_by_program = {
    "pota": [{
        location: "US-AK"
    },
    {
        location: "US-AZ"
    },
    {
        location: "US-HI"
    },
    {
        location: "US-ME"
    },
    {
        location: "US-MT"
    },
    {
        location: "US-NM"
    },
    {
        location: "US-OR"
    },
    {
        location: "US-SD"
    },
    {
        location: "US-WA"
    },
    {
        location: "US-WY"
    },
    {
        location: "US-TX"
    }
]
}

let handle_control_request = (request) => {
    for(rig_configuration of rig_configurations) {
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
}

let evaluate_objects = (subset, superset) => {
    for(const property in subset) {
        if(subset.hasOwnProperty(property)) {
            if(subset[property] != superset[property]) {
                return false;
            }
        }
    }

    return true
}

let evaluate_spot_alerts = (program, spot) => {
    let alerts_for_program = alerts_by_program[program]

    for(const alert_configuration of alerts_for_program) {
        if(evaluate_objects(alert_configuration, spot)) {
            return true;
        }
    }
}

let handle_spots_data = (request, tab_id) => {
    console.log("Spot data: ");

    spots_by_program[request.program] = request;

    console.log(spots_by_program);

    potential_alert_spots = request.spots.filter(spot => evaluate_spot_alerts(request.program, spot))

    if(potential_alert_spots.length) {
        let new_alerts = false;

        for(const spot of potential_alert_spots) {
            existing_alert = spots_to_alert.filter( (existing) => evaluate_objects(spot, existing) && existing.program == request.program)

            if(!existing_alert.length) {
                let new_alert = spot
                new_alert.tab_id = tab_id
                new_alert.program = request.program
                spots_to_alert.push(new_alert)

                new_alerts = true
            }
        }

        if(new_alerts) {
            console.log(spots_to_alert)

            chrome.action.setIcon({ path: "images/signal_alert.png"})
        } else {
            //We leave the existing icon in place.  This will be cleared when alerts are viewed.
        }
    }
    
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.type == "control") {
            handle_control_request(request);
        } else if(request.type == "spots") {
            handle_spots_data(request, sender?.tab?.id);
        } else if(request.type == "alerts") {
            chrome.action.setIcon({ path: "images/signal_empty.png"})

            sendResponse(
                {spots: spots_to_alert}
            );

            console.log("Alerts retrieved")
        }

      return true;
    }
);
