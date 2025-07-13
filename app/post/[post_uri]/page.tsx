import { ViewPostPage } from '@/components/view-post-page';
import { fetchWithAuth } from '@/lib/api';
import { getPostThread } from '@/repos/post';
import { getProfile } from '@/repos/profile';
import {
  ThreadViewPost,
  NotFoundPost,
  BlockedPost,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';

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

  // TODO: Figure out a better solution than this one
  function serializeData(
    data:
      | ThreadViewPost
      | NotFoundPost
      | BlockedPost
      | { [k: string]: unknown; $type: string }
      | undefined
  ) {
    return JSON.parse(JSON.stringify(data));
  }

  return (
    <div className='flex flex-col items-center justify-center gap-4 p-4'>
      <p className='text-2xl font-semibold sticky'>Post</p>
      <ViewPostPage
        isSignedIn={!!user?.did}
        data={serializeData(threadResponse?.data?.thread) || []}
        services={services}
        feedDisplayName={feed}
      />
    </div>
  );
}
