import React from 'react';
import RigEntry from './RigEntry';

const RigConfiguration = (props) => {
    let rig_configuration = props.rig_configuration || [];
    let rig_control_settings = props.rig_control_settings || [];

    return (
        <div className="rig_list">
        {
            rig_configuration.map((rig) => 
                <span className="name">{rig.name}</span>
            )
        }
        <RigEntry />
        </div>
    );
};

export default RigConfiguration;