
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import AlertConfigurationDisplay from './AlertConfigurationDisplay';
import { dataCache, alertRepository, rigRepository, ensureDataCache, addStorageChangedListener } from '../../repositories/DataCache'

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />, window.document.querySelector('#rig-container'));
}

let bindAlerts = () => {
    render(<AlertConfigurationDisplay alertConfiguration={dataCache.alert_configuration} alertRepository={alertRepository} />, window.document.querySelector('#alert-container'));
}

addStorageChangedListener((changedKeys:string[]) => {
    console.log(`Storage changed: ${changedKeys}`)

    let rebindRigs = false;
    let rebindAlerts = false;

    if(!changedKeys.length) {
        rebindRigs = true;
        rebindAlerts = true;
    }

    for(const k of changedKeys) {
        if (k === "rig_information") {
            rebindRigs = true;
        } else if (k === "rig_setup") {
            rebindRigs = true;
        } else if (k === "alert_configuration") {
            rebindAlerts = true;
        }
    }
    if (rebindRigs) {
        bindRigs();
    }
    if (rebindAlerts) {
        bindAlerts();
    }
});
