import React from 'react';
import TabDescriptor from '../../TabDescriptor';

const TabDisplay = (props: any) => {
  let highlightTab: (tab_id: number) => void = props.highlightTab;
  let tab: TabDescriptor = props.tab

  const tabClick = () => {
    highlightTab(tab.tab_id);
  }

  return (
    <tr className="Tab" onClick={() => tabClick()}>
     <td>{tab.program}</td>
     <td>{tab.spot_count}</td>
     <td>{tab.cw_spots}</td>
     <td>{tab.ssb_spots}</td>
    </tr>
  );
};

export default TabDisplay;