import { ProfileManager } from '@/services/profile-manager';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { HomePage } from '@/components/home-page';

export default async function Page() {
  const profile = await ProfileManager.getProfile();

  const { feeds, defaultFeed } = await FeedPermissionManager.getUserFeeds(
    profile?.did
  );

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  return <HomePage feeds={allFeeds} />;
}
