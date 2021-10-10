
import React from 'react';
import { render } from 'react-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import RigConfiguration from './RigConfiguration';
import './index.css';

const rig_information = {}

chrome.storage.local.get(['rig_configuration', 'rig_control_settings'], (items) => {
    Object.assign(rig_information, items);

    render(<RigConfiguration rigs={rig_information.rig_configuration} />, window.document.querySelector('#app-container'));
});
