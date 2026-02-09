
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import AlertConfigurationDisplay from './AlertConfigurationDisplay';
import NativeHostStatus from './NativeHostStatus';
import { dataCache, alertRepository, rigRepository, ensureDataCache, addStorageChangedListener } from '../../repositories/DataCache'

let statusRoot: Root | null = null;
let rigsRoot: Root | null = null;
let alertsRoot: Root | null = null;

let bindStatus = () => {
    const container = window.document.querySelector('#status-container');
    if (container) {
        if (!statusRoot) {
            statusRoot = createRoot(container);
        }
        statusRoot.render(<NativeHostStatus />);
    }
}

let bindRigs = () => {
    const container = window.document.querySelector('#rig-container');
    if (container) {
        if (!rigsRoot) {
            rigsRoot = createRoot(container);
        }
        rigsRoot.render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />);
    }
}

let bindAlerts = () => {
    const container = window.document.querySelector('#alert-container');
    if (container) {
        if (!alertsRoot) {
            alertsRoot = createRoot(container);
        }
        alertsRoot.render(<AlertConfigurationDisplay alertConfiguration={dataCache.alert_configuration} alertRepository={alertRepository} />);
    }
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

// Bind status component on page load (only needs to be done once)
bindStatus();
