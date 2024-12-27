'use client';

import React from 'react';
import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';

interface Moderator {
  did: string;
  handle: string;
  role: string;
  displayName?: string;
  avatar?: string;
}

interface Feed {
  uri: string;
  displayName: string;
}

interface ManageModeratorsProps {
  moderators: Moderator[];
  feed: Feed;
}

export const ManageModerators = ({
  moderators,
  feed,
}: ManageModeratorsProps) => {
  const [moderatorState, setModeratorState] =
    React.useState<Moderator[]>(moderators);
  const handleDemote = async (modDid: string, feedUri: string) => {
    try {
      const response = await fetch('/api/admin/mods', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDid: modDid,
          feedUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to demote moderator');
      }

      setModeratorState((prev) => prev.filter((mod) => mod.did !== modDid));
    } catch (error) {
      console.error('Error demoting moderator:', error);
    }
  };

  return (
    <section className='p-4 space-y-6 w-full max-w-2xl mx-auto'>
      <div className='space-y-4'>
        {moderatorState.map((mod) => (
          <article
            key={mod.did}
            className='bg-app-background border border-app-border rounded-md shadow-sm p-4 flex'
          >
            <div className='mr-4'>
              {mod.avatar ? (
                <OptimizedImage
                  src={mod.avatar}
                  alt={`${mod.displayName || mod.handle}'s avatar`}
                  className='w-12 h-12 rounded-full'
                />
              ) : (
                <div className='w-12 h-12 bg-app-secondary rounded-full' />
              )}
            </div>

            <div className='flex w-full flex-col  tablet:flex-row justify-between flex-grow items-start'>
              <div>
                <h3 className='text-sm font-semibold text-app'>
                  {mod.displayName || mod.handle}
                </h3>
                <p className='text-xs text-app-secondary'>@{mod.handle}</p>
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
                    onClick={() => handleDemote(mod.did, feed.uri)}
                  >
                    Demote
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
