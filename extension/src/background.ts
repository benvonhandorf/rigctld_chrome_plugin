import * as object_matcher from "./object_matcher";
import Spot from "./Spot";
import Alert from "./Alert";
import { Message, ControlMessage, HighlightMessage, SpotsMessage, RetrieveAlertsMessage, AlertsMessage, MessageType } from "./Messages";
import { RigType, RigConfiguration, RigInformation } from "./RigConfiguration";
import AlertConfiguration from "./AlertConfiguration";
import { evaluateSpotAlerts } from "./AlertEvaluator";

console.log("Background setup is beginning");

//Transient and rebuilt from dataCache.spots_by_tab and alerts_by_program configuration, not stored
var currentAlerts: Alert[] = [];

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

        console.log("ensureDataCache")
        console.log(dataCache);
    } catch (e) {
        console.log("Error loading dataCache");
        console.log(e);
    }
}

let handleControlRequest = (request: ControlMessage) => {
    if (dataCache.rig_information == null || dataCache.rig_setup == null) {
        chrome.runtime.openOptionsPage();
        return;
    }

    for (const rigId of dataCache.rig_setup) {
        const rig_information = dataCache.rig_information.filter((rig: RigInformation) => rig.id === rigId)[0];

        console.log("Control request: ");
        request.rig = rig_information;
        console.log(request);

        try {
            chrome.runtime.sendNativeMessage('com.skyironstudio.rigctld_native_messaging_host',
                request,
                function (response) {
                    console.log(`Received from rig ${rig_information.name}:`);
                    console.log(response);
                });
        } catch (e) {
            console.log(e);
        }
    }
}

let setAlertsIndicator = () => {
    chrome.action.setIcon({ path: "images/signal_alert.png" });

    if (true) {
        // var alertAudio = new Audio(chrome.runtime.getURL("audio/alert.mp3"));
        // alertAudio.play();
    }
}

let clearAlertsIndicator = () => {
    chrome.action.setIcon({ path: "images/signal_empty.png" });
}

let evaluateAlertsForSpotsByTab = (tab_id: number) => {
    let spotsForTab = dataCache.spots_by_tab[tab_id] || [];

    console.log(`Spot data for tab ${tab_id}: `);
    console.log(spotsForTab);

    let vestigialAlertsFromTab = currentAlerts.filter((existing: Spot) => existing.tab_id == tab_id)

    const alertsForCurrentSpots: Alert[] = spotsForTab.map((spot: Spot) => evaluateSpotAlerts(spot, dataCache.alert_configuration)).filter((item: Alert | unknown) => item)

    if (alertsForCurrentSpots.length) {
        let hasNewAlerts = false;

        for (const alert of alertsForCurrentSpots) {
            console.log(alert)
            console.log(currentAlerts)
            let existingAlerts = currentAlerts.filter((existing) => object_matcher.spotsSameIncludingFrequency(alert, existing))

            if (!existingAlerts.length) {
                currentAlerts.push(alert)

                hasNewAlerts = true
            } else {
                for (const existingAlert of existingAlerts) {
                    //Alerts that still match active data in the tab and the alert criteria
                    //aren't vestigial... remove them from that list.
                    let alertIndex = vestigialAlertsFromTab.indexOf(existingAlert)

                    if (alertIndex != -1) {
                        vestigialAlertsFromTab.splice(alertIndex, 1)
                    }
                }
            }
        }

        console.log("Current alerts:");
        console.log(currentAlerts);

        if (hasNewAlerts) {
            setAlertsIndicator();
        }
    }

    for (const existing_alert of vestigialAlertsFromTab) {
        //Remove any alerts which are no longer in the spot data for this tab or no longer match
        //the alert criteria
        let alert_index = currentAlerts.indexOf(existing_alert)

        currentAlerts.splice(alert_index, 1)
    }

    if (currentAlerts?.length) {
        //We leave the existing icon in place.  This will be cleared when alerts are viewed.
    } else {
        console.log("No alerts still active");
        clearAlertsIndicator();
    }

    chrome.runtime.sendMessage(new AlertsMessage(currentAlerts));
}

let evaluateAlertsForAllTabs = () => {
    if (dataCache.spots_by_tab == null) {
        return;
    }

    try {
        let promises = [];
        let needsSaving = false;

        for (const tab_id in dataCache.spots_by_tab) {
            const tab_id_number: number = +tab_id

            if (tab_id_number) {
                promises.push(
                    chrome.tabs.get(tab_id_number)
                        .then((tab) => {
                            evaluateAlertsForSpotsByTab(tab_id_number);
                        }).catch((e) => {
                            console.log(`Tab ${tab_id_number} no longer valid`)
                            needsSaving = true;

                            currentAlerts = currentAlerts.filter((alert) => alert.tab_id !== tab_id_number);
                            delete dataCache.spots_by_tab[tab_id];

                            if (!currentAlerts?.length) {
                                console.log("No alerts still active");
                                clearAlertsIndicator();
                            }
                        }));
            }
        }

        if (needsSaving) {
            console.log("Persisting spots_by_tab after modification");

            Promise.all(promises)
                .then(() => {
                    chrome.storage.local.set({ spots_by_tab: dataCache.spots_by_tab })
                        .then(() => {
                            console.log("Spot data serialized")
                            console.log(dataCache.spots_by_tab)
                        });
                });
        }
    } catch (e) {
        console.log(e)
        console.log(dataCache.spots_by_tab)
    }
}

let handleSpotsData = (request: SpotsMessage, tab_id: number) => {

    request.spots.forEach(spot => {
        spot.tab_id = tab_id;
    });

    if (dataCache.spots_by_tab == null) {
        dataCache.spots_by_tab = {};
    }

    dataCache.spots_by_tab[tab_id] = request.spots;

    chrome.storage.local.set({ spots_by_tab: dataCache.spots_by_tab }, () => {
        console.log("Spot data serialized")
    });

    evaluateAlertsForSpotsByTab(tab_id);
}

ensureDataCache().then(() => {
    evaluateAlertsForAllTabs();
});

chrome.storage.onChanged.addListener((changes, area) => {
    console.log(`Data changed - ${area}`)
    console.log(changes);

    for (const k in changes) {
        if (k === "rig_information") {
            console.log("Update rig_information");
            //Apply new rig configuration data
            dataCache.rig_information = []

            Object.assign(dataCache.rig_information, changes.rig_information.newValue);
        } else if (k === "rig_setup") {
            //Apply new rig configuration data
            console.log("Update rig_setup");

            dataCache.rig_setup = [];

            Object.assign(dataCache.rig_setup, changes.rig_setup.newValue)

            console.log(dataCache.rig_setup);
        } else if (k === "alert_configuration") {
            dataCache.alert_configuration = [];
            console.log("Update alert configuration");
            Object.assign(dataCache.alert_configuration, changes.alert_configuration.newValue);

            clearAlertsIndicator();

            evaluateAlertsForAllTabs();
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MessageType.Control) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            handleControlRequest(request);
        });

        return false;
    } else if (request.type === MessageType.Spots) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            handleSpotsData(request, sender?.tab?.id || -1);
        });

        return false;
    } else if (request.type === MessageType.RetrieveAlerts) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            chrome.action.setIcon({ path: "images/signal_empty.png" })

            sendResponse(new AlertsMessage(currentAlerts));
        });

        return true;
    } else if(request.type === MessageType.Highlight) {
        //The tab itself will do the highlighting and scrolling, but it's our job to activate the tab.
        const highlightMessage: HighlightMessage = request

        chrome.tabs.update(request.spot.tab_id, { active: true} );

        //Resend the message to the specific tab
        chrome.tabs.sendMessage(request.spot.tab_id, request);

        return false;
    } else {
        console.log("Unknown message type");
        console.log(request);
        return false;
    }
}
);
