
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import { RigConfiguration, RigInformation, RigType } from '../../RigConfiguration';
import { getStorageItems } from '../../StorageUtil';
import { RigRepository } from './RigRepository';

const dataCache: any = {}

// const changeRigActivation : RigRepostory.ChangeRigActivation = 

// const rig_repository = new RigRepository

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={dataCache.rig_information} rig_setup={dataCache.rig_setup} />, window.document.querySelector('#app-container'));
}

getStorageItems().then((storageItems) => {
    Object.assign(dataCache, storageItems);

    console.log(dataCache);

    bindRigs();
});

// chrome.storage.onChanged.addListener((changes, area) => {
//     let rebind = false;

//     for (const k in changes) {
//         if (k === "rig_information") {
//             //Apply new alert configuration data
//             Object.assign(dataCache.rig_information, changes.rig_information.newValue);

//             rebind = true;
//         } else if (k === "rig_setup") {
//             //Apply new alert configuration data
//             Object.assign(dataCache.rig_setup, changes.rig_setup.newValue);

//             rebind = true;
//         }
//     }
//     if (rebind) {
//         console.log(dataCache);

//         bindRigs();
//     }
// });
