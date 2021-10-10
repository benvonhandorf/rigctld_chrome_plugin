import * as object_matcher from "./object_matcher";
import Spot from "./Spot"
import { Message, ControlMessage, HighlightMessage, SpotsMessage, RetrieveAlertsMessage, AlertsMessage, MessageType } from "./Messages";
import { RigType, RigConfiguration, RigInformation } from "./RigConfiguration";

console.log("Background setup is beginning");

//Transient and rebuilt from dataCache.spots_by_tab and alerts_by_program configuration, not stored
var spots_to_alert: Spot[] = [];

class AlertConfiguration {
    location?: string;
}

//TODO Local storage and configuration
var alerts_by_program = new Map<string, AlertConfiguration[]>()
alerts_by_program.set("pota", [{
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
]);

const dataCache: any = {}

const initDataCache = getAllStorageLocalData().then(items => {
    Object.assign(dataCache, items)
}).then(() => getAllStorageSyncData())
    .then(items => {
        Object.assign(dataCache, items);
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

function getAllStorageSyncData() {
    // Immediately return a promise and start asynchronous work
    return new Promise((resolve, reject) => {
        // Asynchronously fetch all data from storage.sync.
        chrome.storage.sync.get(null, (items) => {
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

let handle_control_request = (request: ControlMessage) => {
    if (dataCache.rig_information == null || dataCache.rig_setup == null) {
        chrome.runtime.openOptionsPage();
        return;
    }

    for (const rig_index of dataCache.rig_setup) {
        const rig_information = dataCache.rig_information[rig_index]

        console.log("Control request: ");
        request.rig = rig_information;
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

let evaluate_spot_alerts = (spot: Spot): boolean => {
    let alerts_for_program = alerts_by_program.get(spot.program)

    if (alerts_for_program == null) {
        return false;
    }

    for (const alert_configuration of alerts_for_program) {
        if (object_matcher.evaluate_objects(alert_configuration, spot)) {
            return true;
        }
    }

    return false
}

let evaluate_alerts_for_spots_by_tab = (tab_id: number) => {
    let tab_spots = dataCache.spots_by_tab[tab_id] || [];

    console.log(`Spot data for tab ${tab_id}: `);
    console.log(tab_spots);

    let vestigial_alerts_from_tab = spots_to_alert.filter((existing: Spot) => existing.tab_id == tab_id)

    const potential_alert_spots = tab_spots.filter((spot: Spot) => evaluate_spot_alerts(spot))

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

    for (const existing_alert of vestigial_alerts_from_tab) {
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

    chrome.runtime.sendMessage(new AlertsMessage(spots_to_alert));
}

let evaluate_alerts_for_all_tabs = () => {
    if (dataCache.spots_by_tab == null) {
        return;
    }

    try {
        for (const tab_id in dataCache.spots_by_tab) {
            const tab_id_number: number = +tab_id
            evaluate_alerts_for_spots_by_tab(tab_id_number);
        }
    } catch (e) {
        console.log(e)
        console.log(dataCache.spots_by_tab)
    }
}

let handle_spots_data = (request: SpotsMessage, tab_id: number) => {

    request.spots.forEach(spot => {
        spot.tab_id = tab_id;
    });

    dataCache.spots_by_tab[tab_id] = request.spots;

    chrome.storage.local.set({ spots_by_tab: dataCache.spots_by_tab }, () => {
        console.log("Spot data serialized")
    });

    evaluate_alerts_for_spots_by_tab(tab_id);
}

ensureDataCache().then(() => {
    evaluate_alerts_for_all_tabs();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MessageType.Control) {
        ensureDataCache().then(() => {
            evaluate_alerts_for_all_tabs();
        }).then(() => {
            handle_control_request(request);
        });

        return false;
    } else if (request.type === MessageType.Spots) {
        ensureDataCache().then(() => {
            evaluate_alerts_for_all_tabs();
        }).then(() => {
            handle_spots_data(request, sender?.tab?.id || -1);
        });

        return false;
    } else if (request.type === MessageType.RetrieveAlerts) {
        ensureDataCache().then(() => {
            evaluate_alerts_for_all_tabs();
        }).then(() => {
            chrome.action.setIcon({ path: "images/signal_empty.png" })

            sendResponse(new AlertsMessage(spots_to_alert));
        });

        return true;
    } else {
        console.log("Unknown message type");
        console.log(request);
        return false;
    }
}
);
