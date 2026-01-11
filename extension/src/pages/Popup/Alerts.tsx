import React from 'react';
import Alert from '../../Alert';
import Spot from '../../Spot';
import AlertSummary from './AlertSummary';

const Alerts = (props: any) : JSX.Element => {
  let alerts : Alert[] = props.alerts;
  const highlightAlert: (alert: Alert) => void = props.highlightAlert;

  if (alerts != null) {
    return (
      <div className="Alerts">
        {
          alerts.map((spot_alert) => <AlertSummary key={spot_alert.alert_id} spot_alert={spot_alert} highlightAlert={highlightAlert}></AlertSummary>)
        }
      </div>
    );
  } else {
    return (<></>);
  }
};

export default Alerts;