'use client';

import { Feed } from '@/components/feed/feed';
import { TabGroup, TabPanel } from '@/components/tab/tab';
import { useSearchParams, useRouter } from 'next/navigation';
import cc from 'classcat';
import { useEffect } from 'react';
import { PermissionPill } from '@/components/permission-pill';
import { UserRole } from '@/lib/types/permission';
import Cookies from 'js-cookie';
import { ModerationService } from '@/lib/types/moderation';

interface Props {
  feeds: {
    description?: string;
    displayName?: string;
    type: UserRole;
    uri: string;
  }[];
  services: ModerationService[] | [];
  isSignedIn: boolean;
}

export const HomePage = ({ feeds, services, isSignedIn }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri');
  const activeTab = feeds.findIndex((feed) => feed.uri === uri) || 0;

  useEffect(() => {
    if (!uri) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('uri', feeds[0].uri);
      router.push(`?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  useEffect(() => {
    const needsRefresh = Cookies.get('needsRefresh');

    if (needsRefresh) {
      Cookies.remove('needsRefresh');

      window.location.reload();
    }
  }, []);

  const tabHeaders = feeds.map((feed) => (
    <div
      key={feed.uri}
      className={cc([
        'flex items-center gap-2',
        { 'justify-center ': feeds.length === 1 },
      ])}
    >
      <span>{feed.displayName}</span>
      <PermissionPill type={feed.type} />
    </div>
  ));

  const handleTabChange = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('uri', feeds[index].uri);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className='container mx-auto p-4'>
      <TabGroup
        data={tabHeaders}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {tabHeaders.map((_, index) => {
          return (
            <TabPanel key={`feed-${index}`}>
              <Feed
                displayName={feeds?.[activeTab]?.displayName}
                services={services}
                isSignedIn={isSignedIn}
              />
            </TabPanel>
          );
        })}
      </TabGroup>
    </div>
  );
};
