import { Card, FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { RigInformation } from '../../RigConfiguration';
import { RigRepository } from '../../repositories/RigRepository';

const RigDisplay = (props: any) => {
    const rig: RigInformation = props.rig
    const rig_enabled: boolean = props.enabled
    const rig_repository: RigRepository.RigRepository = props.rig_repository || null;

    let change_enabled = () => {
        rig_repository.changeRigActivation(rig, !rig_enabled);
    }

    return (
        <div>
            <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <FormControlLabel control={<Switch checked={rig_enabled}/>} onChange={change_enabled} label="Rig Enabled" />
                <div>{rig.name}</div>
                <div>{rig.config.host}</div>
                <div>{rig.config.port}</div>
            </Card>
        </div>
    )
}

export default RigDisplay;