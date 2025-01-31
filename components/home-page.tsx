'use client';

import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import cc from 'classcat';
import { useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Props {
  feeds: {
    description?: string;
    displayName?: string;
    type: string;
    uri: string;
  }[];
}

export const HomePage = ({ feeds }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');
  const activeTab = feeds.findIndex((feed) => feed.uri === uri) || 0;
  const tabRef = useRef<number | null>(null);

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
    TabContent: <Feed key={`feed-${index}`} feedName={feed.displayName} />,
  }));

  const handleTabChange = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('uri', feeds[index].uri);
    tabRef.current = index;
    router.push(`?${params.toString()}`);
  };

  return (
    <div className='container mx-auto p-4'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
