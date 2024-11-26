'use client';

import { FeedList } from '@/components/feed-list/feed-list';
import { usePaginatedFeed } from '@/repos/feed-repo';

interface FeedProps {
  did: string;
  feedName: string;
}

const Feed = (props: FeedProps) => {
  const {
    did = 'did:plc:qzkrgc4ahglknwb7ymee4a6w',
    feedName = 'aaafstml2groe',
  } = props;

  const { feed, error, isFetching, hasNextPage, fetchNextPage } =
    usePaginatedFeed({
      did,
      feedName,
      limit: 10,
    });
  console.log({ feed, error, isFetching, hasNextPage, fetchNextPage });
  if (error) return <div>Error: {error.message}</div>;
  if (!feed) return <div>No feed</div>;

  return (
    <div>
      <FeedList
        feed={feed}
        feedName='Kendrick Test Feed < aaafstml2groe >'
        getNext={() => console.log('Get Next')}
      />
      {hasNextPage && !isFetching && (
        <button onClick={fetchNextPage}>Load More</button>
      )}
    </div>
  );
};

export default Feed;
