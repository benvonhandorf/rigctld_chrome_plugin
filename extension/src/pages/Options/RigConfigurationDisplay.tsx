import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import RigDisplay from './RigDisplay';
import RigEntry from './RigEntry';
import { RigRepository } from './RigRepository';

const RigConfigurationDisplay = (props: any) => {
    const rig_information: RigInformation[] = props.rig_information || [];
    const rig_setup: number[] = props.rig_setup || [];
    const rig_repository: RigRepository.RigRepository = props.rig_repository || null;

    return (
        <div className="rig_list">
            {
                rig_information.map((rig, index) =>
                    <RigDisplay rig={rig} enabled={rig_setup.includes(index)} rig_repository={rig_repository} />
                )
            }
            <RigEntry rig_repository={rig_repository}/>
        </div>
    );
};

export default RigConfigurationDisplay;