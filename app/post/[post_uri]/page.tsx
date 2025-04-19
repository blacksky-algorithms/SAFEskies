import { ViewPostPage } from '@/components/view-post-page';
import { fetchWithAuth } from '@/lib/api';
import { getPostThread } from '@/repos/post';
import { getProfile } from '@/repos/profile';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ post_uri: string }>;
  searchParams: Promise<{ feed: string; uri: string }>;
}) {
  const user = await getProfile();

  const { post_uri } = await params;
  const { feed, uri } = await searchParams;

  const threadResponse = await getPostThread(post_uri);

  const servicesResponse = await fetchWithAuth(
    `/api/moderation/services?uri=${uri}`,
    {
      method: 'GET',
    }
  );
  const { services } = await servicesResponse?.json();

  return (
    <ViewPostPage
      isSignedIn={!!user?.did}
      data={threadResponse?.data?.thread || []}
      services={services}
      feedDisplayName={feed}
    />
  );
}
