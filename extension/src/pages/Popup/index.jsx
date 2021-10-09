
import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup';
import './index.css';

render(<Popup />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();

let bind_alerts = (spots) => {
    console.log(alerts);
}

let retrieve_alerts = () => {
    let request = {type: "alerts"}

    chrome.runtime.sendMessage(request, (response) => {
        bind_alerts(response)
    });

};

retrieve_alerts();