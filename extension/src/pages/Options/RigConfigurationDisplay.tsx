import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import RigDisplay from './RigDisplay';
import RigEntry from './RigEntry';

const RigConfigurationDisplay = (props: any) => {
    const rig_information: RigInformation[] = props.rig_information || [];
    const rig_setup: number[] = props.rig_setup || [];

    return (
        <div className="rig_list">
            {
                rig_information.map((rig, index) =>
                    <RigDisplay rig={rig} enabled={rig_setup.includes(index)} />
                )
            }
            <RigEntry />
        </div>
    );
};

export default RigConfigurationDisplay;