import React from 'react';
import TabDescriptor from '../../TabDescriptor';
import TabDisplay from './TabDisplay';

const TabsDisplay = (props: any) => {
  let highlightTab: (tab_id: number) => void = props.highlightTab;
  let tabs: TabDescriptor[] = props.tabs

  return (
      <table>
          <th>Program</th>
          <th>Spots</th>
          <th>CW</th>
          <th>SSB</th>
          {
              tabs.map( (tab) => <TabDisplay tab={tab} highlightTab={highlightTab}></TabDisplay>)
          }
      </table>
  );
};

export default TabsDisplay;