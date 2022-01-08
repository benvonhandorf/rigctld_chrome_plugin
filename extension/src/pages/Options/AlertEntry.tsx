import React from 'react';
import Box from '@mui/material/Box';
import { TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Button, FormGroup, Checkbox, FormControlLabel, FormLabel } from '@mui/material';
import { AlertRepository } from '../../repositories/AlertRepository';
import AlertConfiguration from '../../AlertConfiguration';
import generateRandomStringId from '../../random_id';

const ALL_PROGRAMS = ["pota", "sota"];
const ALL_BANDS = ["160m", "80m", "40m", "30m", "20m", "17m", "15m", "12m", "10m", "6m", "2m", "70cm"];
const ALL_MODES = ["SSB", "CW", "Digital"]


const AlertEntry = (props: any) => {
    const alertRepository: AlertRepository.AlertRepository = props.alertRepository;



    const updateArray = (list: string[], value: string, include: boolean): string[] => {
        if (include) {
            let index = list.indexOf(value);

            if (index === -1) {
                list.push(value);
            }
        } else {
            let index = list.indexOf(value);

            if (index !== -1) {
                list.splice(index, 1)
            }
        }

        return list;
    };

    const [programs, setPrograms] = React.useState<string[]>([]);

    const handleProgramChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let program = event.target.name;

        setPrograms(updateArray(programs, program, event.target.checked))
    }

    const [modes, setModes] = React.useState<string[]>([]);

    const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let mode = event.target.name;

        setModes(updateArray(modes, mode, event.target.checked))
    }

    const [bands, setBands] = React.useState<string[]>([]);

    const handleBandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let band = event.target.name;

        setBands(updateArray(bands, band, event.target.checked))
    }

    const [callsign, setCallsign] = React.useState("");

    const handleCallsign = (event: React.ChangeEvent<{ value: string }>) => {
        setCallsign(event.target.value);
    }

    const [location, setLocation] = React.useState("");

    const handleLocation = (event: React.ChangeEvent<{ value: string }>) => {
        setLocation(event.target.value);
    }

    const [unit, setUnit] = React.useState("");

    const handleUnit = (event: React.ChangeEvent<{ value: string }>) => {
        setUnit(event.target.value);
    }

    const addAlert = (event: React.MouseEvent<HTMLElement>) => {
        if(!programs.length) {
            event.preventDefault();
            window.alert("You must select at least one program")
            return;
        }

        let new_alert: AlertConfiguration = {
            alert_id: generateRandomStringId(),
            callsign: callsign?.length ? callsign : undefined,
            location: location?.length ? location : undefined,
            unit: unit?.length ? unit : undefined,
            band: bands.length ? bands : undefined,
            mode: modes.length ? modes : undefined,
            program: programs.length ? programs : undefined
        };

        alertRepository.addAlertConfiguration(new_alert);
    }
    return (
        <div>
            <h1>Alert</h1>
            <p>Only specify criteria you wish to restrict by.  Leaving a field blank will match anything.</p>

            <TextField
                required
                id="alert-location"
                label="Location"
                helperText="Location text for area.  e.g. US-GA for POTA or W2 for SOTA."
                onChange={handleLocation}
            />

            <TextField
                required
                id="alert-callsign"
                label="Callsign"
                helperText="Callsign to search for.  No wildcards currently supported."
                onChange={handleCallsign}
            />

            <TextField
                required
                id="alert-unit"
                label="Unit"
                helperText="Specific place being activated.  e.g. K-1234 for POTA or W2/GA-123 for SOTA."
                onChange={handleUnit}
            />

            <FormGroup>
                <FormLabel component="legend">Programs</FormLabel>
                {
                    ALL_PROGRAMS.map((program) => <FormControlLabel label={program} control={<Checkbox onChange={handleProgramChange} name={program} />} />)
                }

            </FormGroup>

            <FormGroup>
                <FormLabel component="legend">Modes</FormLabel>
                {
                    ALL_MODES.map((mode) => <FormControlLabel label={mode} control={<Checkbox onChange={handleModeChange} name={mode} />} />)
                }

            </FormGroup>

            <FormGroup>
                <FormLabel component="legend">Bands</FormLabel>
                {
                    ALL_BANDS.map((band) => <FormControlLabel label={band} control={<Checkbox onChange={handleBandChange} name={band} />} />)
                }

            </FormGroup>

            <Button variant="contained"
                onClick={addAlert}>Add Alert</Button>
        </div>
    );
};

export default AlertEntry;