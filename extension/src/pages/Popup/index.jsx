
import React from 'react';
import { render } from 'react-dom';

import Alerts from './Alerts';
import './index.css';

// if (module.hot) module.hot.accept();

let bind_alerts = (response) => {
    if(response.alerts != null) {
        render(<Alerts alerts={response.alerts} />, window.document.querySelector('#app-container'));
    }
}

let retrieve_alerts = () => {
    let request = {type: "retrieve_alerts"}

    chrome.runtime.sendMessage(request, (response) => {
        bind_alerts(response)
    });

};

retrieve_alerts();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type == "alerts") {
        //New alert data is avalable
        bind_alerts(request);

        return false;
    }
});