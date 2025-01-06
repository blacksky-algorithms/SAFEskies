'use client';

import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import cc from 'classcat';
import { useState, useRef } from 'react';

interface Props {
  feeds: {
    description?: string;
    displayName?: string;
    type: string;
    uri: string;
  }[];
}

export const HomePage = ({ feeds }: Props) => {
  const tabRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(tabRef.current ?? 0);

  const tabs = feeds.map((feed, index) => ({
    title: (
      <div
        className={cc([
          'flex items-center gap-2',
          { 'justify-center ': feeds.length === 1 },
        ])}
      >
        <span>{feed.displayName}</span>
        <span
          className={cc([
            '',
            {
              'bg-app-primary rounded-full px-2 py-1 text-xs':
                !!feed.type && feed.type !== 'user',
              hidden: !feed?.type || feed.type === 'user',
            },
          ])}
        >
          {feed.type}
        </span>
      </div>
    ),
    TabContent: (
      <Feed
        uri={feed.uri}
        key={feed.uri}
        onRefreshComplete={() => setActiveTab(index)}
      />
    ),
  }));

  return (
    <div className='container mx-auto p-4'>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(index) => setActiveTab(index)}
      />
    </div>
  );
};
