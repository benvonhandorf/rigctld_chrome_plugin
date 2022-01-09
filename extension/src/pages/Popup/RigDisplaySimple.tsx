import { Card, FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import { RigRepository } from '../../repositories/RigRepository';

const RigDisplaySimple = (props: any) => {
    const rig: RigInformation = props.rig
    const rig_enabled: boolean = props.enabled
    const rig_repository: RigRepository.RigRepository = props.rig_repository || null;

    let change_enabled = () => {
        rig_repository.changeRigActivation(rig, !rig_enabled);
    }

    return (
        <div>
            <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <FormControlLabel control={<Switch checked={rig_enabled}/>} onChange={change_enabled} label={rig.name} />
            </Card>
        </div>
    )
}

export default RigDisplaySimple;