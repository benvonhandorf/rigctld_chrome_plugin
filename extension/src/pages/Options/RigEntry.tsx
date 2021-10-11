import React from 'react';
import Box from '@mui/material/Box';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const RigEntry = (props: any) => {
    return (
        <div>
            <h1>Rig Configuration</h1>
            <TextField
                required
                id="rig-name"
                label="Name"
            />

            <h2>Connection Settings</h2>
            <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="rig-type-label">Connection Type</InputLabel>
                <Select required
                    labelId="rig-type-label"
                    id="rig-type"
                    label="Type"
                >
                    <MenuItem value="rigctld">Rigctld</MenuItem>
                    <MenuItem value="gqrx">Gqrx or legacy Rigctld</MenuItem>
                </Select>
            </FormControl>

            <TextField
                required
                id="rig-connection-host"
                label="Host"
                helperText="Hostname for this rig control setup"
            />
            <TextField
                required
                id="rig-connection-port"
                label="Port"
                helperText="Port used to connect"
            />

        </div>
    );
};

export default RigEntry;