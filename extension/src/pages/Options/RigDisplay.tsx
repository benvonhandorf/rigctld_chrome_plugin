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
            <Card variant="outlined" sx={{ maxWidth: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>
                            📻 {rig.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            🌐 {rig.config.host}:{rig.config.port}
                        </div>
                    </div>
                    <FormControlLabel
                        control={<Switch checked={rig_enabled}/>}
                        onChange={change_enabled}
                        label={rig_enabled ? "Enabled" : "Disabled"}
                    />
                </div>
            </Card>
        </div>
    )
}

export default RigDisplay;