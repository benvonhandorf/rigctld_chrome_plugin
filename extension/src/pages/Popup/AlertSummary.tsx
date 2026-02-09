import { Card } from '@mui/material';
import React from 'react';
import Alert from '../../Alert';

const AlertSummary = (props: any) => {
  let highlightAlert: (alert: Alert) => void = props.highlightAlert;
  let spot_alert: Alert = props.spot_alert;
  let alert_highlighter 

  const render_field = (alert: Alert, field_name: string, inline: boolean = false) => {
    const value = alert[field_name];
    const isMatched = alert.alert_fields.includes(field_name);

    if (!value) return null;

    const content = isMatched ? (
      <span className="matched_field">{value}</span>
    ) : (
      <span>{value}</span>
    );

    return inline ? content : <div>{content}</div>;
  }

  const render_frequency = (alert: Alert) => {
    const fieldName = "frequency";
    const value = (alert[fieldName] / 1000000).toFixed(3) + " MHz";
    const isMatched = alert.alert_fields.includes(fieldName);

    return isMatched ? (
      <span className="matched_field">{value}</span>
    ) : (
      <span>{value}</span>
    );
  }

  const alertClick = () => {
    highlightAlert(spot_alert);
  }

  return (
    <Card className="Alert" onClick={() => alertClick()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <strong style={{ fontSize: '16px' }}>{render_field(spot_alert, "callsign", true)}</strong>
        <span style={{ fontSize: '14px', color: '#1976d2', fontWeight: 500 }}>{render_frequency(spot_alert)}</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666', flexWrap: 'wrap' }}>
        {spot_alert.unit && <span>📍 {render_field(spot_alert, "unit", true)}</span>}
        {spot_alert.mode && <span>📻 {render_field(spot_alert, "mode", true)}</span>}
        {spot_alert.location && <span>🗺️ {render_field(spot_alert, "location", true)}</span>}
      </div>
    </Card>
  );
};

export default AlertSummary;