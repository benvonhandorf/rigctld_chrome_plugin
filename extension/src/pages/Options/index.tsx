
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

const dataCache: any = {}

const rig_repository : RigRepository.RigRepository = {
    changeRigActivation: function (rig: RigInformation, active: boolean): void {
        console.log(`Changing ${rig} to ${active}`)
        let rig_index = dataCache.rig_information.indexOf(rig);

        if(rig_index == -1) {
            console.log(`Unable to find ${rig} in ${dataCache.rig_information}`)
            return;
        }

        if(active) {
            if(dataCache?.rig_setup?.includes(rig_index)) {
                console.log(`Rig ${rig} already present in rig_setup`);
                return;
            } else {
                dataCache?.rig_setup?.push(rig_index);
            }
        } else {
            if(dataCache?.rig_setup?.includes(rig_index)) {
                let index_index = dataCache?.rig_setup?.indexOf(rig_index);
                dataCache?.rig_setup?.splice(index_index, 1);
            } else {
                console.log(`Rig ${rig} already not present in rig_setup`);
                return;
            }
        }
        chrome.storage.local.set({rig_setup: dataCache.rig_setup});
    },
    addRig: function (rig: RigInformation, active: boolean): void {
        let rig_index = dataCache.rig_information.indexOf(rig);

        if(rig_index != -1) {
            console.log(`Rig ${rig} already present in ${dataCache.rig_information}`)
            return;
        }

        rig_index = dataCache.rig_information.push(rig) - 1;

        if(active) {
            dataCache?.rig_setup.push(rig_index)
        }

        chrome.storage.local.set({rig_information: dataCache.rig_information, rig_setup: dataCache.rig_setup});
    },
    deleteRig: function (rig: RigInformation): void {
        throw new Error('Function not implemented.');
    }
}

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} rig_repository={rig_repository} />, window.document.querySelector('#app-container'));
}

getStorageItems().then((storageItems) => {
    Object.assign(dataCache, storageItems);

    console.log(dataCache);

    bindRigs();
});

chrome.storage.onChanged.addListener((changes, area) => {
    let rebind = false;

    for (const k in changes) {
        if (k === "rig_information") {
            //Apply new alert configuration data
            Object.assign(dataCache.rig_information, changes.rig_information.newValue);

            rebind = true;
        } else if (k === "rig_setup") {
            //Apply new alert configuration data
            Object.assign(dataCache.rig_setup, changes.rig_setup.newValue);

            rebind = true;
        }
    }
    if (rebind) {
        console.log(dataCache);

        bindRigs();
    }
});
