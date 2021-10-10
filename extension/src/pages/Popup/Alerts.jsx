import React from 'react';
import AlertSummary from './AlertSummary';

const Alerts = (props) => {
  let alerts = props.alerts

  if (alerts != null) {
    return (
      <ul className="Alerts">
        {
          alerts.map((spot_alert) => <AlertSummary spot_alert={spot_alert}></AlertSummary>)
        }
      </ul>
    );
  }
};

export default Alerts;