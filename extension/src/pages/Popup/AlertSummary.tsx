import { Card } from '@mui/material';
import React from 'react';
import Alert from '../../Alert';

const AlertSummary = (props: any) => {
  let highlightAlert: (alert: Alert) => void = props.highlightAlert;
  let spot_alert: Alert = props.spot_alert;
  let alert_highlighter 

  const render_field = (alert: Alert, field_name: string) => {

    if (alert.alert_fields.includes(field_name)) {
      return <div className="matched_field">{alert[field_name]}</div>
    } else {
      return <div>{alert[field_name]}</div>
    }
  }

  const render_frequency = (alert: Alert) => {
    const fieldName = "frequency";
    const value = (alert[fieldName] / 1000000).toString() + " MHz"

    if (alert.alert_fields.includes(fieldName)) {
      return <div className="matched_field">{alert[fieldName]}</div>
    } else {
      return <div>{alert[fieldName]}</div>
    }
  }

  const alertClick = () => {
    highlightAlert(spot_alert);
  }

  return (
    <Card className="Alert" onClick={() => alertClick()}>
      {render_field(spot_alert, "callsign")}
      {render_field(spot_alert, "unit")}
      {render_frequency(spot_alert)}
      {render_field(spot_alert, "mode")}
      {render_field(spot_alert, "location")}
    </Card>
  );
};

export default AlertSummary;