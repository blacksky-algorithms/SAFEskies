import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Feed } from '../feed/feed';

interface TabItem {
  uri: string;
  displayName: string;
}

interface TabsProps {
  tabs: TabItem[];
}

export function Tabs({ tabs }: TabsProps) {
  return (
    <TabGroup>
      <TabList className='flex space-x-1 bg-app-background p-1 rounded-md'>
        {tabs.map((tab, index) => (
          <Tab key={index} className='w-full text-center my-4'>
            <h2
              id={`feed-title-${tab.displayName}`}
              className='text-2xl font-bold'
            >
              {tab.displayName}
            </h2>
          </Tab>
        ))}
      </TabList>
      <TabPanels className='mt-2'>
        {tabs.map((tab, index) => (
          <TabPanel key={index}>
            <Feed uri={tab.uri} />
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
