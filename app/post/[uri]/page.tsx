import { ViewPostPage } from '@/components/view-post-page';
import { getPostThread } from '@/repos/post';
import { getProfile } from '@/repos/profile';

export default async function Page({
  params,
}: {
  params: Promise<{ uri: string }>;
}) {
  const user = await getProfile();

  const { uri } = await params;

  const response = await getPostThread(uri);

  const data = JSON.parse(JSON.stringify(response?.data));

  return <ViewPostPage isSignedIn={!!user?.did} data={data.thread} />;
}
