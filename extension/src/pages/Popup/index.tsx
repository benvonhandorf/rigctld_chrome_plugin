
import React from 'react';
import { render } from 'react-dom';

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

const highlightAlert = (alert: Alert) => {
    console.log(alert);
    chrome.runtime.sendMessage(new HighlightMessage(alert));
}

const highlightTab = (tab_id: number) => {
    chrome.runtime.sendMessage(new HighlightTabMessage(tab_id));
}

const bindAlerts = (message: AlertsMessage) => {
    if(message.alerts != null) {
        render(<Alerts alerts={message.alerts} highlightAlert={highlightAlert} />, window.document.querySelector('#alerts-container'));
    }
}

const bindTabs = (message: TabsMessage) => {
    if(message.tabs != null) {
        render(<TabsDisplay tabs={message.tabs} highlightTab={highlightTab} />, window.document.querySelector('#tabs-container'));
    }
}

const bindRigs = ( ) => {
    debugger;
    render(<RigEnableDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />, window.document.querySelector('#rigs-container'));
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