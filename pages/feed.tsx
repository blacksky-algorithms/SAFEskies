import { FeedList } from '@/components/feed-list/feed-list';
import { HTMLAttributes } from 'react';

type FeedProps = HTMLAttributes<HTMLDivElement> & {};
// "at://did:plc:qzkrgc4ahglknwb7ymee4a6w/app.bsky.feed.generator/aaafstml2groe"
const mockProps = {
  did: 'did:plc:qzkrgc4ahglknwb7ymee4a6w',
  feedName: 'aaafstml2groe',
};
const Feed = (props: FeedProps) => {
  return (
    <div>
      <FeedList {...mockProps} />
    </div>
  );
};

export default Feed;
