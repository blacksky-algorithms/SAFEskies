import { ProfileManager } from '@/services/profile-manager';
import { HomePage } from '@/components/home-page';
import { getUserFeeds } from '@/repos/feed-repo';

export default async function Page() {
  const profile = await ProfileManager.getProfile();

  const { feeds, defaultFeed } = await getUserFeeds(profile?.did);

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  return <HomePage feeds={allFeeds} />;
}
