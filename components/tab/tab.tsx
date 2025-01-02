'use client';

import {
  Tab as HeadlessTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import cc from 'classcat';
import { ReactNode } from 'react';

interface TabItem {
  title: string | ReactNode;
  TabContent: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <TabGroup
      selectedIndex={activeTab}
      onChange={onTabChange}
      className='w-full'
    >
      <TabList className='flex space-x-1 bg-app-background p-1 overflow-auto'>
        {tabs.map((tab, index) => (
          <HeadlessTab
            key={index}
            className={({ selected }) =>
              cc([
                'w-full text-center px-4 py-2 cursor-pointer',
                {
                  'border-b-4 border-b-app-primary':
                    selected && tabs.length > 1,
                },
              ])
            }
          >
            <h2
              id={`feed-title-${tab.title}`}
              className='text-2xl font-bold whitespace-nowrap'
            >
              {tab.title}
            </h2>
          </HeadlessTab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab, index) => (
          <TabPanel key={index}>{tab.TabContent}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
