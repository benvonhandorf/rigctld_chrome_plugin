import { Button, Card, Chip, Stack } from '@mui/material';
import React from 'react';
import AlertConfiguration from '../../AlertConfiguration';
import { AlertRepository } from '../../repositories/AlertRepository';

const AlertConfigurationItemDisplay = (props: any) => {
    const alert_configuration_item: AlertConfiguration = props.alert_configuration_item
    const alert_repository: AlertRepository.AlertRepository = props.alert_repository

    const handleDeleteAlert = () => {
        alert_repository.deleteAlertConfiguration(alert_configuration_item.alert_id)
    }

    const render_chips = (items: string[] | undefined, label: string, color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning") => {
        if (!items?.length) return null;
        return (
            <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.5px' }}>{label}</div>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {items.map((item) => <Chip key={item} label={item} size="small" color={color} variant="outlined" />)}
                </Stack>
            </div>
        );
    };

    return (
        <div>
            <Card variant="outlined" sx={{ maxWidth: 600 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        {render_chips(alert_configuration_item.program, "Program", "primary")}

                        {alert_configuration_item.callsign &&
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.5px' }}>Callsign</div>
                                <div style={{ fontSize: '15px' }}>{alert_configuration_item.callsign}</div>
                            </div>
                        }
                        {alert_configuration_item.unit &&
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.5px' }}>Unit</div>
                                <div style={{ fontSize: '15px' }}>{alert_configuration_item.unit}</div>
                            </div>
                        }
                        {alert_configuration_item.location &&
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.5px' }}>Location</div>
                                <div style={{ fontSize: '15px' }}>{alert_configuration_item.location}</div>
                            </div>
                        }

                        {render_chips(alert_configuration_item.mode, "Mode", "secondary")}
                        {render_chips(alert_configuration_item.band, "Band", "info")}
                    </div>

                    <Button size="small" color="error" onClick={handleDeleteAlert} sx={{ minWidth: 'auto', ml: 1 }}>
                        Delete
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default AlertConfigurationItemDisplay;
