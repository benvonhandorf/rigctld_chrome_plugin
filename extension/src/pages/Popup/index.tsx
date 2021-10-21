
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

// if (module.hot) module.hot.accept();

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

const retrieveData = () => {
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

retrieveData();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MessageType.Alerts) {
        //New alert data is avalable
        bindAlerts(request);
    } else if(request.type === MessageType.Tabs) {
        bindTabs(request);
    }

    return false;
});