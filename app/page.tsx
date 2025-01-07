import { HomePage } from '@/components/home-page';
import { getUserFeeds } from '@/repos/feeds';
import { getProfile } from '@/repos/profile';

export default async function Page() {
  const profile = await getProfile();

  const { feeds, defaultFeed } = await getUserFeeds(profile?.did);

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  return <HomePage feeds={allFeeds} />;
}
