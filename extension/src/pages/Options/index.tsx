
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import RigConfigurationDisplay from './RigConfigurationDisplay';
import { RigConfiguration, RigInformation, RigType } from '../../RigConfiguration';

let rig_data: any = {}

rig_data.rig_informations = [
        new RigInformation("FT-891", RigType.Rigctld, new RigConfiguration("localhost", 4532)),
        new RigInformation("Gqrx", RigType.Gqrx, new RigConfiguration("localhost", 7356)),
    ];

chrome.storage.local.get(['rig_configuration', 'rig_control_settings'], (items) => {
    Object.assign(rig_data, items);

    render(<RigConfigurationDisplay rig_informations={rig_data.rig_informations} />, window.document.querySelector('#app-container'));
});
