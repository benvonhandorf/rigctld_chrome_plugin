
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import AlertConfigurationDisplay from './AlertConfigurationDisplay';
import { dataCache, alertRepository, rigRepository } from '../../repositories/DataCache'

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />, window.document.querySelector('#rig-container'));
}

let bindAlerts = () => {
    render(<AlertConfigurationDisplay alertConfiguration={dataCache.alert_configuration} alertRepository={alertRepository} />, window.document.querySelector('#alert-container'));
}

chrome.storage.onChanged.addListener((changes, area) => {
    let rebindRigs = false;
    let rebindAlerts = false;

    for (const k in changes) {
        if (k === "rig_information") {
            //Apply new alert configuration data
            Object.assign(dataCache.rig_information, changes.rig_information.newValue);

            rebindRigs = true;
        } else if (k === "rig_setup") {
            //Apply new alert configuration data
            Object.assign(dataCache.rig_setup, changes.rig_setup.newValue);

            rebindRigs = true;
        } else if (k === "alert_configuration") {
            Object.assign(dataCache.alert_configuration, changes.alert_configuration.newValue);

            rebindAlerts = true;
        }
    }
    if (rebindRigs) {
        console.log(dataCache);

        bindRigs();
    }
    if (rebindAlerts) {
        console.log(dataCache);

        bindAlerts();
    }
});
