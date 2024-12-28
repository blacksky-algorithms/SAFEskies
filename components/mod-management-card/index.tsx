'use client';

import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { useState } from 'react';
import { Button } from '@/components/button';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { FeedPermissionManager } from '@/services/feed-permissions-manager';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';

interface ModManagementState {
  moderators: ProfileViewBasic[];
  isLoading: boolean;
  error: string | null;
  pendingDemotions: Set<string>;
}

interface ModCardProps {
  moderator: ProfileViewBasic;
  isBeingDemoted: boolean;
  onDemote: (modDid: string) => void;
}

const ModCard = ({ moderator, isBeingDemoted, onDemote }: ModCardProps) => (
  <article className='bg-app-background border border-app-border rounded-md shadow-sm p-4 flex'>
    <div className='mr-4'>
      {moderator.avatar ? (
        <OptimizedImage
          src={moderator.avatar}
          alt={`${moderator.name || moderator.handle}'s avatar`}
          className='w-12 h-12 rounded-full'
        />
      ) : (
        <div className='w-12 h-12 bg-app-secondary rounded-full' />
      )}
    </div>

    <div className='flex w-full flex-col tablet:flex-row justify-between flex-grow items-start'>
      <div>
        <h3 className='text-sm font-semibold text-app'>
          {(moderator.name as string) || moderator.handle}
        </h3>
        <p className='text-xs text-app-secondary'>@{moderator.handle}</p>
      </div>

      <div className='flex justify-between tablet:justify-end w-full space-x-4 mt-6 tablet:mt-0'>
        <div>
          <Button
            intent={VisualIntent.Secondary}
            onClick={() => alert('TODO: View logs')}
          >
            View Logs
          </Button>
        </div>
        <div>
          <Button
            intent={VisualIntent.Error}
            onClick={() => onDemote(moderator.did)}
            disabled={isBeingDemoted}
          >
            {isBeingDemoted ? 'Demoting...' : 'Demote'}
          </Button>
        </div>
      </div>
    </div>
  </article>
);

// components/mod-management/mod-management-card.tsx
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
          <ModCard
            key={mod.did}
            moderator={mod}
            isBeingDemoted={state.pendingDemotions.has(mod.did)}
            onDemote={handleDemote}
          />
        ))}
      </div>
    </section>
  );
};
