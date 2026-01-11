
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Alerts from './Alerts';
import './index.css';
import { AlertsMessage, HighlightMessage, HighlightTabMessage, MessageType, RetrieveAlertsMessage, RetrieveTabsMessage, TabsMessage } from '../../Messages';
import Alert from '../../Alert';
import TabsDisplay from './TabsDisplay';
import { addStorageChangedListener, dataCache, ensureDataCache, rigRepository } from '../../repositories/DataCache';
import RigEnableDisplay from './RigConfigurationDisplay';

let alertsRoot: Root | null = null;
let tabsRoot: Root | null = null;
let rigsRoot: Root | null = null;

const highlightAlert = (alert: Alert) => {
    console.log(alert);
    chrome.runtime.sendMessage(new HighlightMessage(alert));
}

const highlightTab = (tab_id: number) => {
    chrome.runtime.sendMessage(new HighlightTabMessage(tab_id));
}

const bindAlerts = (message: AlertsMessage) => {
    if(message.alerts != null) {
        const container = window.document.querySelector('#alerts-container');
        if (container) {
            if (!alertsRoot) {
                alertsRoot = createRoot(container);
            }
            alertsRoot.render(<Alerts alerts={message.alerts} highlightAlert={highlightAlert} />);
        }
    }
}

const bindTabs = (message: TabsMessage) => {
    if(message.tabs != null) {
        const container = window.document.querySelector('#tabs-container');
        if (container) {
            if (!tabsRoot) {
                tabsRoot = createRoot(container);
            }
            tabsRoot.render(<TabsDisplay tabs={message.tabs} highlightTab={highlightTab} />);
        }
    }
}

const bindRigs = ( ) => {
    debugger;
    const container = window.document.querySelector('#rigs-container');
    if (container) {
        if (!rigsRoot) {
            rigsRoot = createRoot(container);
        }
        rigsRoot.render(<RigEnableDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />);
    }
}

addStorageChangedListener((changedKeys:string[]) => {
    console.log(`Storage changed: ${changedKeys}`)

    let rebindRigs = false;

    if(!changedKeys.length) {
        rebindRigs = true;
    }

    for(const k of changedKeys) {
        if (k === "rig_information" || k === "rig_setup") {
            rebindRigs = true;
        }
    }
    
    if (rebindRigs) {
        bindRigs();
    }
});

async function init() {
    let request = new RetrieveAlertsMessage();

    chrome.runtime.sendMessage(request, (response) => {
        console.log(response);
        bindAlerts(response);
    });

    let requestTabs = new RetrieveTabsMessage();

    chrome.runtime.sendMessage(requestTabs, (response) => {
        console.log(requestTabs);
        bindTabs(response);
    });
};

init();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MessageType.Alerts) {
        //New alert data is avalable
        bindAlerts(request);
    } else if(request.type === MessageType.Tabs) {
        //New tab data is available
        bindTabs(request);
    }

    return false;
});