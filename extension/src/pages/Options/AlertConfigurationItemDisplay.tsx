import { Card, FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import AlertConfiguration from '../../AlertConfiguration';
import { AlertRepository } from './AlertRepository';

const AlertConfigurationItemDisplay = (props: any) => {
    const alert_configuration_item: AlertConfiguration = props.alert_configuration_item
    const alert_repository: AlertRepository.AlertRepository = props.alert_repository

    console.log(alert_configuration_item);

    const render_section = (section_data: any[] | undefined, section_title: string) => {
        if (section_data) {
            return (
                <div>{section_title}: {
                    section_data.map((item) => {{<span>{item}</span>}})
                }
                </div>
            )
        } else {
            return (
                <></>
            )
        }
    }


    return (
        <div>
            <Card variant="outlined" sx={{ maxWidth: 345 }}>
                {alert_configuration_item.callsign &&
                    <div>Callsign: <span>{alert_configuration_item.callsign}</span></div>
                }
                {alert_configuration_item.unit &&
                    <div>Unit: <span>{alert_configuration_item.unit}</span></div>
                }
                {alert_configuration_item.location &&
                    <div>Location: <span>{alert_configuration_item.location}</span></div>
                }
                {
                    render_section(alert_configuration_item.mode, "Mode")
                }
                {
                    render_section(alert_configuration_item.band, "Band")
                }
            </Card>
        </div>
    )
}

export default AlertConfigurationItemDisplay;