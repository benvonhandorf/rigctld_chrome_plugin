import React from 'react';
import Box from '@mui/material/Box';
import { TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Button } from '@mui/material';
import { RigRepository } from '../../repositories/RigRepository';
import { RigConfiguration, RigInformation, RigType } from '../../RigConfiguration';
import generateRandomStringId from '../../random_id';

const RigEntry = (props: any) => {
    const rig_repository: RigRepository.RigRepository = props.rig_repository;

    const [rigType, setRigType] = React.useState(RigType.Rigctld);

    const handleRigType = (event: SelectChangeEvent<RigType>) => {
        if (event.target.value == RigType.Rigctld || event.target.value == RigType.Gqrx) {
            setRigType(event.target.value);
        }
    }

    const [rigName, setRigName] = React.useState("");

    const handleRigName = (event: React.ChangeEvent<{ value: string }>) => {
        setRigName(event.target.value);
    }

    const [hostname, setHostname] = React.useState("");

    const handleHostname = (event: React.ChangeEvent<{ value: string }>) => {
        setHostname(event.target.value);
    }

    const [port, setPort] = React.useState(5555);

    const handlePort = (event: React.ChangeEvent<{ value: string }>) => {
        try {
            let port_number = parseInt(event.target.value)
            setPort(port_number);
        } catch (e) {

        }
    }

    const add_rig = () => {
        const rigConfiguration = new RigConfiguration(hostname, port)

        const rig = new RigInformation(generateRandomStringId(), rigName, rigType, rigConfiguration)

        rig_repository.addRig(rig, true)
    }
    
    return (
        <div>
            <h1>Rig Configuration</h1>
            <TextField
                required
                id="rig-name"
                label="Name"
                onChange={handleRigName}
            />

            <h2>Connection Settings</h2>
            <FormControl required sx={{ minWidth: 200 }}>
                <InputLabel id="rig-type-label">Connection Type</InputLabel>
                <Select required
                    labelId="rig-type-label"
                    id="rig-type"
                    label="Type"
                    defaultValue={rigType}
                    onChange={handleRigType}
                >
                    <MenuItem value={RigType.Rigctld}>Rigctld</MenuItem>
                    <MenuItem value={RigType.Gqrx}>Gqrx or legacy Rigctld</MenuItem>
                </Select>
            </FormControl>

            <TextField
                required
                id="rig-connection-host"
                label="Host"
                helperText="Hostname for this rig control setup"
                onChange={handleHostname}
            />
            <TextField
                required
                id="rig-connection-port"
                label="Port"
                helperText="Port used to connect"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={handlePort}
            />

            <Button variant="contained"
                onClick={add_rig}>Add Rig</Button>
        </div>
    );
};

export default RigEntry;