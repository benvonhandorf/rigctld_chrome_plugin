
import React from 'react';
import { render } from 'react-dom';

import RigConfiguration from './RigConfiguration';
import './index.css';

const rig_information = {}

chrome.storage.local.get(['rig_configuration', 'rig_control_settings'], (items) => {
    Object.assign(rig_information, items);

    render(<RigConfiguration rigs={rig_information.rig_configuration} />, window.document.querySelector('#app-container'));
});
