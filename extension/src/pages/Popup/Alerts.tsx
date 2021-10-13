import React from 'react';
import Spot from '../../Spot';
import AlertSummary from './AlertSummary';

const Alerts = (props: any) : JSX.Element => {
  let alerts : Spot[] = props.alerts

  if (alerts != null) {
    return (
      <div className="Alerts">
        {
          alerts.map((spot_alert) => <AlertSummary spot_alert={spot_alert}></AlertSummary>)
        }
      </div>
    );
  } else {
    return (<></>);
  }
};

export default Alerts;