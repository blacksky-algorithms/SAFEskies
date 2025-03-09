'use server';

import { HomePage } from '@/components/home-page';
import { getProfile } from '@/repos/profile';
import { getUserFeeds } from '@/repos/feeds';

export default async function Page() {
  const profile = await getProfile();

  const { feeds, defaultFeed } = await getUserFeeds(profile?.did);

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  return <HomePage feeds={allFeeds} />;
}
