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
            <Card variant="outlined" sx={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        📻 {rig.name}
                    </span>
                    <Switch
                        checked={rig_enabled}
                        onChange={change_enabled}
                        size="small"
                    />
                </div>
            </Card>
        </div>
    )
}

export default RigDisplaySimple;