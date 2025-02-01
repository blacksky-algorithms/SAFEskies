import { FeedLogs } from '@/components/logs/components/feed-logs';
import { getProfile } from '@/repos/profile';

interface PageProps {
  params: {
    uri: string;
  };
}

export default async function Page({ params }: PageProps) {
  const user = await getProfile();
  if (!user) {
    return null;
  }
  const awaitedParams = await params;
  const decodedUri = decodeURIComponent(awaitedParams.uri);

  return <FeedLogs uri={decodedUri} />;
}
