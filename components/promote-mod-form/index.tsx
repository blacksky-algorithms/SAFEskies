'use client';

import { useCallback, useState } from 'react';

import { FeedSelector } from '../feed-selector';
import { BSUserSearch } from '../bs-user-search/bs-user-search';
import { Button } from '../button';
import { VisualIntent } from '@/enums/styles';
import { useToast } from '@/contexts/toast-context';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { useFeedRoles } from '@/hooks/useFeedRoles';
import { PromoteModState } from '@/lib/types/moderation';
import { promoteToModerator } from '@/repos/permission';

export const PromoteModForm = ({
  feeds,
  currentUserDid,
}: {
  feeds: Feed[];
  currentUserDid: string;
}) => {
  const INITIAL_STATE: PromoteModState = {
    selectedUser: null,
    selectedFeeds: [],
    disabledFeeds: [],
    isLoading: false,
    error: null,
  };
  const [state, setState] = useState<PromoteModState>(INITIAL_STATE);

  const { toast } = useToast();
  const { checkFeedRole, isLoading: isRoleCheckLoading } = useFeedRoles();

  const checkExistingRoles = useCallback(
    async (user: ProfileViewBasic) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const disabledFeedUris: string[] = [];

        // Check all feeds in parallel for better performance
        const roleChecks = await Promise.all(
          feeds.map(async (feed) => {
            const role = await checkFeedRole(user.did, feed.uri);
            return { uri: feed.uri, role };
          })
        );

        // Collect feeds where user is already a mod or admin
        roleChecks.forEach(({ uri, role }) => {
          if (role === 'mod' || role === 'admin') {
            disabledFeedUris.push(uri);
          }
        });

        setState((prev) => ({
          ...prev,
          disabledFeeds: disabledFeedUris,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error checking roles:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to check user roles',
          isLoading: false,
        }));
      }
    },
    [feeds, checkFeedRole]
  );

  const handleSelectUser = async (user: ProfileViewBasic) => {
    setState((prev) => ({
      ...prev,
      selectedUser: user,
      selectedFeeds: [],
      disabledFeeds: [],
    }));
    await checkExistingRoles(user);
  };

  const handleToggleFeed = (feed: Feed) => {
    if (state.disabledFeeds.includes(feed.uri)) return;

    setState((prev) => {
      const isSelected = prev.selectedFeeds.some((f) => f.uri === feed.uri);
      const selectedFeeds = isSelected
        ? prev.selectedFeeds.filter((f) => f.uri !== feed.uri)
        : [...prev.selectedFeeds, feed];

      return { ...prev, selectedFeeds };
    });
  };

  const handleSelectAll = () => {
    setState((prev) => {
      const availableFeeds = feeds.filter(
        (feed) => !prev.disabledFeeds.includes(feed.uri)
      );
      const selectedFeeds =
        prev.selectedFeeds.length < availableFeeds.length ? availableFeeds : [];

      return { ...prev, selectedFeeds };
    });
  };

  const handlePromote = async () => {
    if (!state.selectedUser || state.selectedFeeds.length === 0) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await Promise.all(
        state.selectedFeeds.map((feed) =>
          promoteToModerator({
            targetUserDid: state.selectedUser!.did,
            uri: feed.uri,
            setByUserDid: currentUserDid,
            feedName: (feed.displayName as string) || '',
          })
        )
      );
      console.log({ results });
      if (results.some((result) => !result.success)) {
        throw new Error('Failed to promote moderator for some feeds');
      }

      toast({
        title: 'Success',
        message: 'Successfully promoted user to moderator',
        intent: VisualIntent.Success,
      });

      setState(INITIAL_STATE);
    } catch (error) {
      console.error('Error promoting moderator:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to promote moderator',
        isLoading: false,
      }));

      toast({
        title: 'Error',
        message: state.error || 'An error occurred',
        intent: VisualIntent.Error,
      });
    }
  };

  return (
    <div className='space-y-6 w-full max-w-2xl mx-auto'>
      {state.error && <div className='text-red-500 text-sm'>{state.error}</div>}

      <div className='space-y-2'>
        {!state.selectedUser && <BSUserSearch onSelect={handleSelectUser} />}

        {state.selectedUser && !isRoleCheckLoading && (
          <FeedSelector
            feeds={feeds}
            state={state}
            onToggleFeed={handleToggleFeed}
            onSelectAll={handleSelectAll}
          />
        )}

        {(state.isLoading || isRoleCheckLoading) && (
          <div className='flex justify-center items-center'>
            <LoadingSpinner />
          </div>
        )}
      </div>

      {state.selectedUser && !isRoleCheckLoading && (
        <Button
          onClick={handlePromote}
          disabled={
            !state.selectedUser ||
            state.selectedFeeds.length === 0 ||
            state.isLoading
          }
        >
          {state.isLoading ? 'Promoting...' : 'Promote User'}
        </Button>
      )}
    </div>
  );
};
