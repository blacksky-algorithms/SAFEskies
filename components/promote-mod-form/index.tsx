'use client';

import { useState } from 'react';

import { FeedSelector } from '../feed-selector';
import { BSUserSearch } from '../bs-user-search/bs-user-search';
import { Button } from '../button';
import { VisualIntent } from '@/enums/styles';
import { useToast } from '@/contexts/toast-context';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { GeneratorView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

interface PromoteModFormProps {
  feeds: GeneratorView[];
}

export const PromoteModForm = ({ feeds }: PromoteModFormProps) => {
  const [selectedUser, setSelectedUser] = useState<null | {
    did: string;
    handle: string;
    displayName?: string;
  }>(null);
  const [selectedFeeds, setSelectedFeeds] = useState<GeneratorView[]>([]);
  const { toast } = useToast();

  const handlePromote = async () => {
    if (!selectedUser || selectedFeeds.length === 0) {
      toast({
        title: 'Error',
        message: 'Please select a user and at least one feed',
        intent: VisualIntent.Error,
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/mods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDid: selectedUser.did,
          feeds: selectedFeeds,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote moderator');
      }
    } catch (error) {
      console.error('Error promoting moderator:', error);
      toast({
        title: 'Error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to promote moderator',
        intent: VisualIntent.Error,
      });
    }
  };

  const handleSelectedUser = (user: ProfileViewBasic) => setSelectedUser(user);
  const handleSelectedFeeds = (feeds: GeneratorView[]) =>
    setSelectedFeeds(feeds);

  return (
    <div className='space-y-6 w-full max-w-2xl mx-auto'>
      <div className='space-y-2'>
        {!selectedUser ? <BSUserSearch onSelect={handleSelectedUser} /> : null}
      </div>

      {selectedUser && (
        <div className='space-y-2'>
          <FeedSelector
            feeds={feeds}
            selectedFeeds={selectedFeeds}
            onSelect={handleSelectedFeeds}
            userToPromote={
              `@${selectedUser.handle!}` || selectedUser.displayName!
            }
          />
        </div>
      )}

      <Button
        onClick={handlePromote}
        disabled={!selectedUser || selectedFeeds.length === 0}
      >
        Promote User
      </Button>
    </div>
  );
};
