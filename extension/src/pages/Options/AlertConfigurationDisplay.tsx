import { Card, FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import AlertConfiguration from '../../AlertConfiguration';
import AlertConfigurationItemDisplay from './AlertConfigurationItemDisplay';
import AlertEntry from './AlertEntry';
import { AlertRepository } from '../../repositories/AlertRepository';

const AlertConfigurationDisplay = (props: any) => {
    const alertConfiguration: AlertConfiguration[] = props.alertConfiguration
    const alertRepository: AlertRepository.AlertRepository = props.alertRepository

    return (
        <div className="alert_configuration_section">
            {
                alertConfiguration.map( (alertConfigurationItem) => {
                    return (<AlertConfigurationItemDisplay key={alertConfigurationItem.alert_id} alert_configuration_item={alertConfigurationItem} alert_repository={alertRepository} />)
                })
            }

            <AlertEntry alertRepository={alertRepository} />
        </div>
    )
}

export default AlertConfigurationDisplay;