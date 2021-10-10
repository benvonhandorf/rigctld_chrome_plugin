import React from 'react';

const AlertSummary = (props) => {
  let spot_alert = props.spot_alert;

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