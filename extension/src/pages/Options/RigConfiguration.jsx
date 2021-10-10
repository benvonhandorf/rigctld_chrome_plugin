import React from 'react';

const RigConfiguration = (props) => {
    let rig_configuration = props.rig_configuration;
    let rig_control_settings = props.rig_control_settings;

    return (
        <div className="rig_list">
        {
            rig_configuration.map((rig) => 
                <span className="name">{rig.name}</span>
            )
        }
        </div>
    );
};

export default RigConfiguration;