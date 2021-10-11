import { Card, FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { RigInformation } from '../../RigConfiguration';

const RigDisplay = (props: any) => {
    const rig: RigInformation = props.rig
    const rig_enabled: boolean = props.enabled

    return (
        <div>
            <Card variant="outlined" sx={{ maxWidth: 345 }}>
                <FormControlLabel control={<Switch checked={rig_enabled}/>} label="Rig Enabled" />
                <div>{rig.name}</div>
                <div>{rig.config.host}</div>
                <div>{rig.config.port}</div>
            </Card>
        </div>
    )
}

export default RigDisplay;