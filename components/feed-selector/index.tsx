'use client';

import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { Checkbox } from '../input/checkbox';
import { PromoteModState } from '../promote-mod-form';

interface FeedSelectorProps {
  feeds: Feed[];
  state: PromoteModState;
  onToggleFeed: (feed: Feed) => void;
  onSelectAll: () => void;
}

export function FeedSelector({
  feeds,
  state,
  onToggleFeed,
  onSelectAll,
}: FeedSelectorProps) {
  const isFeedSelected = (item: Feed) =>
    state.selectedFeeds.some((selected) => selected.uri === item.uri);

  const isFeedDisabled = (item: Feed) => state.disabledFeeds.includes(item.uri);

  const availableFeeds = feeds.filter((feed) => !isFeedDisabled(feed));
  const isAllSelected =
    state.selectedFeeds.length === availableFeeds.length &&
    availableFeeds.length > 0;

  if (!state.selectedUser) return null;

  return (
    <form className='space-y-6 mx-auto'>
      <header className='space-y-2'>
        <h2 className='text-lg font-bold text-app flex items-center flex-wrap justify-center tablet:justify-normal gap-1'>
          Promote {state.selectedUser.handle} to Moderator
        </h2>
        <p className='text-sm text-app-secondary'>
          Select the feeds where this user should be promoted to moderator.
          Feeds where they are already a moderator or admin are disabled.
        </p>
      </header>

      <fieldset className='space-y-3 border border-app-border p-4 rounded-md'>
        <legend className='font-semibold text-app mb-2'>Feeds Selection</legend>
        <div className='flex flex-col space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {feeds.map((item) => {
              const isDisabled = isFeedDisabled(item);
              return (
                <div key={item.cid as string} className='flex flex-col gap-1'>
                  <Checkbox
                    id={`select-feed-${item.cid}`}
                    label={(item.displayName as string) || 'Unnamed Feed'}
                    checked={
                      isDisabled === true ? isDisabled : isFeedSelected(item)
                    }
                    onChange={() => onToggleFeed(item)}
                    disabled={isDisabled}
                  />
                  {isDisabled && (
                    <span className='text-xs'>Already authorized</span>
                  )}
                </div>
              );
            })}
          </div>
          <Checkbox
            label={`Select All Available Feeds (${availableFeeds.length})`}
            checked={isAllSelected}
            onChange={onSelectAll}
            id='select-all-feeds'
          />
        </div>
      </fieldset>
    </form>
  );
}
