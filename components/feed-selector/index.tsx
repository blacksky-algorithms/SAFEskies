'use client';

import { Checkbox } from '../input/checkbox';
import { GeneratorView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface FeedSelectorProps {
  feeds: GeneratorView[];
  onSelect: (selectedFeeds: GeneratorView[]) => void;
  userToPromote: string;
  selectedFeeds: GeneratorView[];
}

export function FeedSelector({
  feeds,
  onSelect,
  userToPromote,
  selectedFeeds,
}: FeedSelectorProps) {
  const isFeedSelected = (item: GeneratorView) => {
    return selectedFeeds.some((selected) => selected.uri === item.uri);
  };

  const handleToggle = (item: GeneratorView) => {
    const isAlreadySelected = selectedFeeds.some(
      (selected) => selected.uri === item.uri
    );

    const updatedFeeds = isAlreadySelected
      ? selectedFeeds.filter((feed) => feed.uri !== item.uri)
      : [...selectedFeeds, item];

    onSelect(updatedFeeds);
  };

  const handleSelectAll = () => {
    if (selectedFeeds.length < feeds.length) {
      onSelect(feeds);
    } else {
      onSelect([]);
    }
  };

  const isAllSelected =
    selectedFeeds.length === feeds.length && feeds.length > 0;

  return (
    <form className='space-y-6 mx-auto'>
      <header className='space-y-2'>
        <h2 className='text-lg font-bold text-app flex items-center flex-wrap justify-center tablet:justify-normal gap-1'>
          Promote
          <span className='p-2 flex flex-col border rounded bg-app-secondary-hover border-app-border'>
            <span>{userToPromote}</span>
          </span>
          to Moderator
        </h2>
        <p className='text-sm text-app-secondary'>
          Select the feeds where this user should be promoted to moderator. Use
          &quot;Select All Feeds&quot; for bulk selection.
        </p>
      </header>

      <fieldset className='space-y-3 border border-app-border p-4 rounded-md'>
        <legend className='font-semibold text-app mb-2'>Feeds Selection</legend>
        <div className='flex flex-col space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {feeds.map((item) => (
              <Checkbox
                id={`select-feed-${item.cid}`}
                key={item.cid}
                label={item.displayName || 'Feed has no display name'}
                checked={isFeedSelected(item)}
                onChange={() => handleToggle(item)}
              />
            ))}
          </div>
          <Checkbox
            label='Select All Feeds'
            checked={isAllSelected}
            onChange={handleSelectAll}
            id='select-all-feeds'
          />
        </div>
      </fieldset>
    </form>
  );
}
