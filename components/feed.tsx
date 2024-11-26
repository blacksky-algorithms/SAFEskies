'use client';

import { FeedList } from '@/components/feed-list/feed-list';
import { useFeed } from '@/repos/feed-repo';

interface FeedProps {
  did: string;
  feedName: string;
}

const Feed = (props: FeedProps) => {
  const {
    did = 'did:plc:qzkrgc4ahglknwb7ymee4a6w',
    feedName = 'aaafstml2groe',
  } = props;
  const { data, error, isValidating } = useFeed({
    did,
    feedName,
  });

  if (isValidating) return <div>isValidating...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.feed) return <div>No feed</div>;

  return (
    <div>
      <FeedList
        feed={data.feed}
        feedName='Kendrick Test Feed < aaafstml2groe >'
        getNext={() => console.log('Get Next')}
      />
    </div>
  );
};

export default Feed;
