import * as object_matcher from "./object_matcher";
import Spot from "./Spot";
import Alert from "./Alert";
import { ControlMessage, HighlightMessage, SpotsMessage, AlertsMessage, MessageType, TabsMessage, HighlightTabMessage, NotifyAlertsMessage, NativeHostStatusMessage, NativeHostStatusInfo } from "./Messages";
import { RigInformation } from "./RigConfiguration";
import { evaluateSpotAlerts } from "./AlertEvaluator";
import TabDescriptor from "./TabDescriptor";
import { dataCache, ensureDataCache, optionRepository } from './repositories/DataCache';

console.log("Background setup is beginning");

//Transient and rebuilt from dataCache.spots_by_tab and alerts_by_program configuration, not stored
var currentAlerts: Alert[] = [];

//Transient status informationzs
var alertIndicatorLit = false
var breakInSet = false;

let updateIcon = () => {
    if (alertIndicatorLit) {
        if (breakInSet) {
            chrome.action.setIcon({ path: "images/signal_alert_bk.png" });
        } else {
            chrome.action.setIcon({ path: "images/signal_alert.png" });
        }
    } else {
        if (breakInSet) {
            chrome.action.setIcon({ path: "images/signal_empty_bk.png" });
        } else {
            chrome.action.setIcon({ path: "images/signal_empty.png" });
        }
    }
}

let setAlertsIndicator = () => {
    alertIndicatorLit = true;

    updateIcon();

    if (true) {
        // var alertAudio = new Audio(chrome.runtime.getURL("audio/alert.mp3"));
        // alertAudio.play();
    }
}

let clearAlertsIndicator = () => {
    alertIndicatorLit = false;
    
    updateIcon();
}

let parseNativeResponse = (rig_response: any) => {
    console.log(rig_response)
    
    if (!rig_response) {
        console.log(`No response from native client`)
        return
    }

    if (rig_response.hasOwnProperty('break_in')) {
        breakInSet = rig_response['break_in']
        updateIcon()
    }
}

let handleControlRequest = (request: ControlMessage) => {
    if (dataCache.rig_information == null || dataCache.rig_setup == null) {
        chrome.runtime.openOptionsPage();
        return;
    }

    for (const rigId of dataCache.rig_setup) {
        const rigs = dataCache.rig_information.filter((rig: RigInformation) => rig.id === rigId);
        
        if(rigs == null || rigs.length == 0) {
            continue;
        }

        const rig_information: RigInformation = rigs[0];

        console.log(`Control request: ${rig_information.name}`);
        request.rig = rig_information;
        console.log(request);

        try {
            chrome.runtime.sendNativeMessage('com.skyironstudio.rigctld_native_messaging_host',
                request,
                function (response) {
                    parseNativeResponse(response)
                });

        } catch (e) {
            console.log(e);
        }
    }
}

let notifyAlerts = (request: NotifyAlertsMessage) => {
    try {
        console.log(`Sending Notify Alerts: ${request}`)

        chrome.runtime.sendNativeMessage('com.skyironstudio.rigctld_native_messaging_host',
            request,
            function (response) {
                parseNativeResponse(response)
            });

    } catch (e) {
        console.log('Error in notifyAlerts:')
        console.log(e);
    }
}

let checkNativeHostStatus = (sendResponse: (response: NativeHostStatusMessage) => void) => {
    try {
        chrome.runtime.sendNativeMessage(
            'com.skyironstudio.rigctld_native_messaging_host',
            { type: 'ping' },
            function (response) {
                const lastError = chrome.runtime.lastError;
                if (lastError) {
                    console.log('Native host error:', lastError.message);
                    const status: NativeHostStatusInfo = {
                        connected: false,
                        error: lastError.message
                    };
                    sendResponse(new NativeHostStatusMessage(status));
                } else if (response) {
                    console.log('Native host response:', response);
                    const status: NativeHostStatusInfo = {
                        connected: true,
                        version: response.version
                    };
                    sendResponse(new NativeHostStatusMessage(status));
                } else {
                    const status: NativeHostStatusInfo = {
                        connected: false,
                        error: 'No response from native host'
                    };
                    sendResponse(new NativeHostStatusMessage(status));
                }
            }
        );
    } catch (e) {
        console.log('Error checking native host:', e);
        const status: NativeHostStatusInfo = {
            connected: false,
            error: e instanceof Error ? e.message : 'Unknown error'
        };
        sendResponse(new NativeHostStatusMessage(status));
    }
}

let evaluateAlertsForSpotsByTab = (tab_id: number) => {
    let spotsForTab = dataCache.spots_by_tab[tab_id] || [];

    console.log(`Spot data for tab ${tab_id}: `);
    console.log(spotsForTab);
    console.log(currentAlerts);

    let vestigialAlertsFromTab = currentAlerts.filter((existing: Spot) => existing.tab_id == tab_id)

    const alertsForCurrentSpots: Alert[] = spotsForTab.map((spot: Spot) => evaluateSpotAlerts(spot, dataCache.alert_configuration)).filter((item: Alert | unknown) => item)

    console.log(`Alerts for tab ${tab_id}: `)
    console.log(alertsForCurrentSpots);

    let newAlerts: Alert[] = []

    if (alertsForCurrentSpots.length) {
        for (const alert of alertsForCurrentSpots) {
            let existingAlerts = currentAlerts.filter((existing) => object_matcher.spotsSameIncludingFrequency(alert, existing))

            console.log(`Existing: ${existingAlerts.length} for alert ${alert.alert_id}`)

            if (!existingAlerts.length) {
                console.log(`Adding ${alert.alert_id} to new alerts`)
                newAlerts.push(alert)
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

        if (newAlerts.length) {
            setAlertsIndicator();

            notifyAlerts(new NotifyAlertsMessage(newAlerts));

            console.log("Current alerts:");
            console.log(currentAlerts);

            console.log("New alerts:");
            console.log(newAlerts);

            console.log("Vestigial alerts:");
            console.log(vestigialAlertsFromTab);

            //Add new alerts to current alerts
            currentAlerts.push(...newAlerts)
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

    chrome.runtime.sendMessage(new AlertsMessage(currentAlerts), (response) => {
        if (response) {
            console.log(`AlertsMessage response:`)
            console.log(response)
        }
    });
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
                        }).catch((e) => {
                            console.log(`Error in evaluateAlertsForAllTabs: ${e}`)
                        });
                }).catch((e) => {
                    console.log(`Error in evaluateAlertsForAllTabs outer: ${e}`)
                });
        }
    } catch (e) {
        console.log(e)
        console.log(dataCache.spots_by_tab)
    }
}

let constructTabList = (): TabDescriptor[] => {
    let results: TabDescriptor[] = [];

    if (dataCache.spots_by_tab == null) {
        return results;
    }

    for (const tab_id in dataCache.spots_by_tab) {
        const tab_id_number: number = +tab_id;

        const program = dataCache.spots_by_tab[tab_id][0]?.program || "Unknown";
        const count = (dataCache.spots_by_tab[tab_id] || []).length;
        const cw_count = (dataCache.spots_by_tab[tab_id]?.filter((spot: Spot) => spot.mode === "CW") || []).length
        const ssb_count = (dataCache.spots_by_tab[tab_id]?.filter((spot: Spot) => spot.mode === "SSB") || []).length

        const tab_descriptor = new TabDescriptor(tab_id_number, program, count, cw_count, ssb_count);

        results.push(tab_descriptor);
    }

    return results;
}

let constructTabMessage = (): TabsMessage => {
    const tabs = constructTabList();

    const message = new TabsMessage(tabs);

    return message;
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

    chrome.runtime.sendMessage(constructTabMessage(), (response) => {
        if (response) {
            console.log(`Tab message response:`)
            console.log(response)
        }
    });
}

ensureDataCache().then(() => {
    evaluateAlertsForAllTabs();
}).catch((e) => {
    console.log(`Error in initial evaluateDataCache: ${e}`)
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
        }).catch((e) => {
            console.log(`Error processing Control Message: ${e}`)
        });

        return false;
    } else if (request.type === MessageType.Spots) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            handleSpotsData(request, sender?.tab?.id || -1);
        }).catch((e) => {
            console.log(`Error processing Spots Message: ${e}`)
        });

        return false;
    } else if (request.type === MessageType.RetrieveAlerts) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            chrome.action.setIcon({ path: "images/signal_empty.png" })

            sendResponse(new AlertsMessage(currentAlerts));
        }).catch((e) => {
            console.log(`Error processing RetrieveAlerts Message: ${e}`)
        });

        return true;
    } else if (request.type === MessageType.RetrieveTabs) {
        ensureDataCache().then(() => {
            evaluateAlertsForAllTabs();
        }).then(() => {
            const message = constructTabMessage();

            sendResponse(message);
        }).catch((e) => {
            console.log(`Error processing RetrieveTabs Message: ${e}`)
        });

        return true;
    } else if (request.type === MessageType.Highlight) {
        //The tab itself will do the highlighting and scrolling, but it's our job to activate the tab.
        const highlightMessage: HighlightMessage = request

        chrome.tabs.update(request.spot.tab_id, { active: true });

        if (request.spot) {
            //Resend the message to the specific tab
            chrome.tabs.sendMessage(request.spot.tab_id, request);
        }

        return false;
    } else if (request.type === MessageType.HighlightTab) {
        //The tab itself will do the highlighting and scrolling, but it's our job to activate the tab.
        const highlightMessage: HighlightTabMessage = request

        chrome.tabs.update(request.tab_id, { active: true });

        return false;
    } else if (request.type === MessageType.CheckNativeHost) {
        checkNativeHostStatus(sendResponse);
        return true;
    } else {
        console.log("Unknown message type");
        console.log(request);
        return false;
    }
}
);

console.log('Completed configuring extension');