import React from 'react';
import Spot from '../../Spot';

const AlertSummary = (props: any) => {
  let spot_alert: Spot = props.spot_alert;

  return (
    <li className="Alert">
      <span>{spot_alert.callsign}</span>
      <span>{spot_alert.unit}</span>
      <span>{spot_alert.frequency}</span>
      <span>{spot_alert.location}</span>
    </li>
  );
};

export default AlertSummary;