'use client';

import { Feed } from '@/components/feed/feed';
import { Tabs } from '@/components/tab/tab';
import { useSearchParams, useRouter } from 'next/navigation';
import cc from 'classcat';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (!uri) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('uri', feeds[0].uri);
      params.delete('redirected');
      router.push(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const tabs = feeds.map((feed, index) => ({
    title: (
      <div
        key={feed.uri}
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
    router.push(`?${params.toString()}`);
  };

  return (
    <div className='container mx-auto p-4'>
      <Tabs data={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
