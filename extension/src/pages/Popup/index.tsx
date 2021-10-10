
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Alerts from './Alerts';
import './index.css';
import { AlertsMessage, RetrieveAlertsMessage } from '../../Messages';

// if (module.hot) module.hot.accept();

let bind_alerts = (message: AlertsMessage) => {
    if(message.spots != null) {
        render(<Alerts alerts={message.spots} />, window.document.querySelector('#app-container'));
    }
}

let retrieve_alerts = () => {
    let request = new RetrieveAlertsMessage();

    chrome.runtime.sendMessage(request, (response) => {
        console.log(response);
        bind_alerts(response);
    });

};

retrieve_alerts();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request instanceof AlertsMessage) {
        //New alert data is avalable
        bind_alerts(request);
    }

    return false;
});