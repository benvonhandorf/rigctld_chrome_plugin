
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

const storageData: any = {}

let bindRigs = () => {
    render(<RigConfigurationDisplay rig_information={storageData.rig_information} rig_setup={storageData.rig_setup} />, window.document.querySelector('#app-container'));
}

getStorageItems().then( (storageItems) => {
    Object.assign(storageData, storageItems);
    
    console.log(storageData);

    bindRigs();
});

chrome.storage.onChanged.addListener((changes, area) =>{
    Object.assign(storageData, changes);

    console.log(storageData);

    bindRigs();
});
