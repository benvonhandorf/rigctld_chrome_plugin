
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import { RigInformation } from '../../RigConfiguration';
import { getStorageItems } from '../../StorageUtil';
import { RigRepository } from './RigRepository';

import { AlertRepository } from './AlertRepository';
import AlertConfigurationDisplay from './AlertConfigurationDisplay';
import AlertConfiguration from '../../AlertConfiguration';

const dataCache: any = {}

const rigRepository: RigRepository.RigRepository = {
    changeRigActivation: function (rig: RigInformation, active: boolean): void {
        console.log(`Changing ${rig} to ${active}`)
        
        if (active) {
            if (dataCache?.rig_setup?.includes(rig.id)) {
                console.log(`Rig ${rig} already present in rig_setup`);
                return;
            } else {
                dataCache?.rig_setup?.push(rig.id);
            }
        } else {
            if (dataCache?.rig_setup?.includes(rig.id)) {
                let index_index = dataCache?.rig_setup?.indexOf(rig.id);
                dataCache?.rig_setup?.splice(index_index, 1);
            } else {
                console.log(`Rig ${rig} already not present in rig_setup`);
                return;
            }
        }
        chrome.storage.local.set({ rig_setup: dataCache.rig_setup });
    },
    addRig: function (rig: RigInformation, active: boolean): void {
        let rigIndex = dataCache.rig_information.findIndex((rig_candidate: RigInformation) => rig_candidate.id === rig.id);

        if (rigIndex !== -1) {
            console.log(`Rig ${rig} already present in ${dataCache.rig_information}`)
            return;
        }

        dataCache.rig_information.push(rig) - 1;

        if (active) {
            dataCache?.rig_setup.push(rig.id)
        }

        chrome.storage.local.set({ rig_information: dataCache.rig_information, rig_setup: dataCache.rig_setup });
    },
    deleteRig: function (rigId: string): void {
        let rigIndex = dataCache.rig_information.findIndex((rig_candidate: RigInformation) => rig_candidate.id === rigId);

        if (rigIndex !== -1) {
            dataCache.rig_information.splice(rigIndex, 1);

            dataCache.rig_setup = dataCache.rig_setup.filter((id:string) => id !== rigId);

            chrome.storage.sync.set({ rig_information: dataCache.rig_information, rig_setup: dataCache.rig_setup });
        }

    }
}

const alertRepository: AlertRepository.AlertRepository = {
    addAlertConfiguration: function (alert: AlertConfiguration): void {
        console.log(alert);


        let alertIndex = dataCache.alert_configuration.findIndex((config: AlertConfiguration) => config.alert_id === alert.alert_id);

        if (alertIndex === -1) {
            dataCache.alert_configuration.push(alert);

            chrome.storage.sync.set({ alert_configuration: dataCache.alert_configuration });
        }
    },
    deleteAlertConfiguration: function (alertId: string): void {
        console.log(alert);

        let alertIndex = dataCache.alert_configuration.findIndex((config: AlertConfiguration) => config.alert_id === alertId);

        if (alertIndex !== -1) {
            dataCache.alert_configuration.splice(alertIndex, 1);

            chrome.storage.sync.set({ alert_configuration: dataCache.alert_configuration });
        }
    }
}

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rigRepository} />, window.document.querySelector('#rig-container'));
}

let bindAlerts = () => {
    render(<AlertConfigurationDisplay alertConfiguration={dataCache.alert_configuration} alertRepository={alertRepository} />, window.document.querySelector('#alert-container'));
}

getStorageItems().then((storageItems) => {
    Object.assign(dataCache, storageItems);

    console.log(dataCache);

    bindRigs();
    bindAlerts();
});

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
