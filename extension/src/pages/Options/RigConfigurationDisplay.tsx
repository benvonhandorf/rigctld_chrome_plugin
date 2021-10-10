import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import RigEntry from './RigEntry';

const RigConfigurationDisplay = (props: any) => {
    const rig_informations : RigInformation[] = props.rig_informations || [];

    return (
        <div className="rig_list">
        {
            rig_informations.map((rig) => 
                <span className="name">{rig.name}</span>
            )
        }
        <RigEntry />
        </div>
    );
};

export default RigConfigurationDisplay;