import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import { RigRepository } from '../../repositories/RigRepository';
import RigDisplaySimple from './RigDisplaySimple';

const RigEnableDisplay = (props: any) => {
    const rig_information: RigInformation[] = props.rig_information || [];
    const rig_setup: string[] = props.rig_setup || [];
    const rig_repository: RigRepository.RigRepository = props.rig_repository || null;

    return (
        <div className="rig_list">
            {
                rig_information.map((rig:RigInformation) =>
                    <RigDisplaySimple key={rig.id} rig={rig} enabled={rig_setup.includes(rig.id)} rig_repository={rig_repository} />
                )
            }
        </div>
    );
};

export default RigEnableDisplay;