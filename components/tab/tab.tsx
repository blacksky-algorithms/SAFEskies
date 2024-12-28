'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import cc from 'classcat';

import { ReactNode } from 'react';

interface TabItem {
  title: string | ReactNode;
  TabContent: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
}

export function Tabs({ tabs }: TabsProps) {
  return (
    <TabGroup className='w-full'>
      <TabList className='flex space-x-1 bg-app-background p-1'>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            className={({ selected }) =>
              cc([
                'w-full text-center my-4 p-2 cursor-pointer',
                {
                  'border-b-4 border-b-app-primary':
                    selected && tabs.length > 1,
                },
              ])
            }
          >
            <h2 id={`feed-title-${tab.title}`} className='text-2xl font-bold'>
              {tab.title}
            </h2>
          </Tab>
        ))}
      </TabList>
      <TabPanels className='mt-2'>
        {tabs.map((tab, index) => (
          <TabPanel key={index}>{tab.TabContent}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
