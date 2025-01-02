'use client';

import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { useState } from 'react';
import Link from 'next/link';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';
import { ModActionCard } from './components/mod-action-card';

interface ModManagementState {
  moderators: ProfileViewBasic[];
  isLoading: boolean;
  error: string | null;
  pendingDemotions: Set<string>;
}

export const ModManagementCard = ({
  moderators: initialModerators,
  feed,
  currentUserDid,
}: {
  moderators: ProfileViewBasic[];
  feed: Feed;
  currentUserDid: string;
}) => {
  const [state, setState] = useState<ModManagementState>({
    moderators: initialModerators,
    isLoading: false,
    error: null,
    pendingDemotions: new Set(),
  });

  const { toast } = useToast();

  const handleDemote = async (modDid: string) => {
    try {
      const success = await FeedPermissionManager.setFeedRole(
        modDid,
        feed.uri,
        'user',
        currentUserDid,
        feed.displayName as string
      );

      if (!success) {
        throw new Error('Failed to demote moderator');
      }

      setState((prev) => ({
        ...prev,
        moderators: prev.moderators.filter((mod) => mod.did !== modDid),
        pendingDemotions: new Set(
          [...prev.pendingDemotions].filter((did) => did !== modDid)
        ),
      }));

      toast({
        title: 'Success',
        message: 'Successfully demoted moderator',
        intent: VisualIntent.Success,
      });
    } catch (error) {
      console.error('Error demoting moderator:', error);
    }
  };

  if (state.error) {
    return <div className='text-red-500 p-4 text-center'>{state.error}</div>;
  }

  // Handle empty state within the component
  if (state.moderators.length === 0) {
    return (
      <span className='flex flex-col items-center space-y-4 p-6 bg-app-secondary-light rounded-md border border-app-border max-w-2xl mx-auto mt-6'>
        <p className='text-app-secondary text-sm'>No Moderators Assigned</p>
        <Link
          href='/admin/mods/promote'
          className='text-app-primary font-semibold hover:underline'
        >
          Promote User to Moderator
        </Link>
      </span>
    );
  }

  return (
    <section className='p-4 space-y-6 w-full max-w-2xl mx-auto'>
      <div className='space-y-4'>
        {state.moderators.map((mod) => (
          <ModActionCard
            key={mod.did}
            moderator={mod}
            isBeingDemoted={state.pendingDemotions.has(mod.did)}
            onDemote={handleDemote}
            feedUri={feed.uri as string}
          />
        ))}
      </div>
    </section>
  );
};
