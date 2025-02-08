'use client';

import {
  Tab as HeadlessTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import cc from 'classcat';
import { ReactNode, useEffect, useRef } from 'react';

interface TabItem {
  title: string | ReactNode;
  TabContent: ReactNode;
}

interface TabsProps {
  data: TabItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export function Tabs({ data, activeTab, onTabChange }: TabsProps) {
  const activeTabRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, []); // a hack to scroll to the active tab on mount after refreshing on mobile - do better natalie

  return (
    <TabGroup
      selectedIndex={activeTab}
      onChange={onTabChange}
      className='w-full'
    >
      <TabList className='flex space-x-1 bg-app-background p-1 overflow-auto'>
        {data.map((tab, index) => (
          <HeadlessTab
            key={index}
            className={({ selected }) =>
              cc([
                'w-full text-center px-4 py-2 cursor-pointer',
                {
                  'border-b-4 border-b-app-primary':
                    selected && data.length > 1,
                },
              ])
            }
          >
            <h2
              ref={activeTabRef}
              id={`feed-title-${tab.title}`}
              className='text-2xl font-bold whitespace-nowrap'
            >
              {tab.title}
            </h2>
          </HeadlessTab>
        ))}
      </TabList>
      <TabPanels>
        {data.map((tab, index) => (
          <TabPanel key={index}>{tab.TabContent}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}

export const Tab = ({ children }: { children: ReactNode }) => {
  return <TabPanel>{children}</TabPanel>;
};
