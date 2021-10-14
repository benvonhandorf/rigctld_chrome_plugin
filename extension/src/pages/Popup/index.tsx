
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Alerts from './Alerts';
import './index.css';
import { AlertsMessage, HighlightMessage, MessageType, RetrieveAlertsMessage } from '../../Messages';
import Alert from '../../Alert';

// if (module.hot) module.hot.accept();

const highlightAlert = (alert: Alert) => {
    console.log(alert);
    chrome.runtime.sendMessage(new HighlightMessage(alert));
}

const bindAlerts = (message: AlertsMessage) => {
    if(message.alerts != null) {
        render(<Alerts alerts={message.alerts} highlightAlert={highlightAlert} />, window.document.querySelector('#app-container'));
    }
}

const retrieveAlerts = () => {
    let request = new RetrieveAlertsMessage();

    chrome.runtime.sendMessage(request, (response) => {
        console.log(response);
        bindAlerts(response);
    });

};

retrieveAlerts();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === MessageType.Alerts) {
        //New alert data is avalable
        bindAlerts(request);
    }

    return false;
});