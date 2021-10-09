import * as object_matcher from "./object_matcher";

console.log("Background setup is beginning");

//TODO Local storage and configuration
var rigs = [
    {
        "name": "FT-891",
        "type": "rigctld",
        "config": {
            "host": "localhost",
            "port": 4532
        }
    }, {
        "name": "Gqrx",
        "type": "gqrx",
        "config": {
            "host": "localhost",
            "port": 7356
        }
    }
]

var rig_configurations = [rigs[0], rigs[1]]

//Transient and rebuilt from dataCache.spots_by_tab and alerts_by_program configuration, not stored
var spots_to_alert = [];

//TODO Local storage and configuration
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

const dataCache = {}

const initDataCache = getAllStorageLocalData().then(items => {
    Object.assign(dataCache, items)
});

function getAllStorageLocalData() {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
        // Asynchronously fetch all data from storage.sync.
        chrome.storage.local.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            // Pass the data retrieved from storage down the promise chain.
            resolve(items);
        });
    });
}

async function ensureDataCache() {
    try {
        await initDataCache;
    } catch (e) {
        console.log("Error loading dataCache");
        console.log(e);
    }
}

let handle_control_request = (request) => {
    for (rig_configuration of rig_configurations) {
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
        } catch (e) {
            console.log(e);
        }
    }
}

let evaluate_spot_alerts = (spot) => {
    let alerts_for_program = alerts_by_program[spot.program]

    for(const alert_configuration of alerts_for_program) {
        if(object_matcher.evaluate_objects(alert_configuration, spot)) {
            return true;
        }
    }
}

let evaluate_alerts_for_spots_by_tab = (tab_id) => {
    let tab_spots = dataCache.spots_by_tab[tab_id] || [];

    console.log(`Spot data for tab ${tab_id}: `);

    console.log(tab_spots);

    let vestigial_alerts_from_tab = spots_to_alert.filter((existing) => existing.tab_id == tab_id)

    const potential_alert_spots = tab_spots.filter(spot => evaluate_spot_alerts(spot))

    if (potential_alert_spots.length) {
        let new_alerts = false;

        for (const spot of potential_alert_spots) {
            let existing_alerts = spots_to_alert.filter((existing) => object_matcher.spots_same_including_frequency(spot, existing))

            if (!existing_alerts.length) {
                spots_to_alert.push(spot)

                new_alerts = true
            } else {
                console.log(spot)
                console.log(existing_alerts)

                for (const existing_alert of existing_alerts) {
                    //Alerts that still match active data in the tab and the alert criteria
                    //aren't vestigial... remove them from that list.
                    let alert_index = vestigial_alerts_from_tab.indexOf(existing_alert)

                    if (alert_index != -1) {
                        vestigial_alerts_from_tab.splice(alert_index, 1)
                    }
                }
            }
        }

        console.log("Current alerts:");
        console.log(spots_to_alert);

        if (new_alerts) {
            chrome.action.setIcon({ path: "images/signal_alert.png" });
        }
    }

    for (existing_alert of vestigial_alerts_from_tab) {
        //Remove any alerts which are no longer in the spot data for this tab or no longer match
        //the alert criteria
        let alert_index = spots_to_alert.indexOf(existing_alert)

        spots_to_alert.splice(alert_index, 1)
    }

    if (spots_to_alert?.length) {
        //We leave the existing icon in place.  This will be cleared when alerts are viewed.
    } else {
        console.log("No spots still active");
        chrome.action.setIcon({ path: "images/signal_empty.png" });
    }
}

let evaluate_alerts_for_all_tabs = () => {
    for (const tab_id in dataCache.spots_by_tab) {
        evaluate_alerts_for_spots_by_tab(tab_id);
    }
}

let handle_spots_data = (request, tab_id) => {

    request.spots.forEach(spot => {
        spot.tab_id = tab_id;
        spot.program = request.program;
    });

    if (dataCache?.spots_by_tab == null) {
        dataCache.spots_by_tab = {}
    }

    dataCache.spots_by_tab[tab_id] = request.spots;

    chrome.storage.local.set({ spots_by_tab: dataCache.spots_by_tab }, () => {
        console.log("Spot data serialized")
    });

    evaluate_alerts_for_spots_by_tab(tab_id);
}

ensureDataCache().then(() => {
    evaluate_alerts_for_all_tabs();
});

chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        await ensureDataCache();

        if (request.type == "control") {
            handle_control_request(request);
        } else if (request.type == "spots") {
            handle_spots_data(request, sender?.tab?.id);
        } else if (request.type == "alerts") {
            chrome.action.setIcon({ path: "images/signal_empty.png" })

            sendResponse(
                { spots: spots_to_alert }
            );

            console.log("Alerts retrieved")
        }

        return true;
    }
);
