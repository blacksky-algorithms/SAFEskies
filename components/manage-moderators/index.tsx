'use client';

import React from 'react';

interface ManageModeratorsProps {
  user: { name: string };
  moderatorsByFeed: {
    feed: { uri: string; displayName: string };
    moderators: { did: string; handle: string; role: string }[];
  }[];
}

export const ManageModerators = ({
  user,
  moderatorsByFeed,
}: ManageModeratorsProps) => {
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

      console.log('Moderator successfully demoted:', modDid);
    } catch (error) {
      console.error('Error demoting moderator:', error);
    }
  };

  return (
    <section className='flex flex-col items-center h-full p-4 space-y-8'>
      <h2 className='text-2xl font-bold'>Moderator Management</h2>
      <p>Welcome to Admin Mod Management, {user.name}!</p>

      <div className='w-full max-w-2xl space-y-8'>
        <div className='space-y-4'>
          <h3 className='text-xl'>Current Moderators</h3>
          {moderatorsByFeed.length > 0 ? (
            moderatorsByFeed.map(({ feed, moderators }) => (
              <div key={feed.uri} className='space-y-2'>
                <h4 className='text-lg font-semibold'>{feed.displayName}</h4>
                {moderators.length > 0 ? (
                  <ul className='list-disc pl-5'>
                    {moderators.map((mod) => (
                      <li
                        key={mod.did}
                        className='flex justify-between items-center'
                      >
                        <span>@{mod.handle}</span>
                        <button
                          className='text-red-500 hover:underline'
                          onClick={() => handleDemote(mod.did, feed.uri)}
                        >
                          Demote
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No moderators found for this feed.</p>
                )}
              </div>
            ))
          ) : (
            <p>No admin feeds found.</p>
          )}
        </div>
      </div>
    </section>
  );
};
