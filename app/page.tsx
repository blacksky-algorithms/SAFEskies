'use server';

import { HomePage } from '@/components/home-page';
import { getProfile } from '@/repos/profile';
import { getUserFeeds } from '@/repos/feeds';
import { fetchWithAuth } from '@/lib/api';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ uri: string }>;
}) {
  const profile = await getProfile();
  const awaitedParams = await searchParams;

  const { feeds, defaultFeed } = await getUserFeeds(profile?.did);

  const allFeeds = feeds.length > 0 ? feeds : [defaultFeed];

  const response = await fetchWithAuth(
    `/api/moderation/services?uri=${awaitedParams.uri}`,
    {
      method: 'GET',
    }
  );
  const { services } = await response?.json();

  return (
    <HomePage
      feeds={allFeeds}
      services={services || []}
      isSignedIn={!!profile?.did}
    />
  );
}
