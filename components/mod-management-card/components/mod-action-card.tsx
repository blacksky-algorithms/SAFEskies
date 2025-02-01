'use client';

import { VisualIntent } from '@/enums/styles';
import { Button } from '@/components/button';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

interface ModActionCardProps {
  moderator: ProfileViewBasic;
  isBeingDemoted: boolean;
  onDemote: (modDid: string) => void;
  feedUri: string;
}

export const ModActionCard = ({
  moderator,
  isBeingDemoted,
  onDemote,
  feedUri,
}: ModActionCardProps) => (
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

      <div className='flex items-center justify-between tablet:justify-end w-full space-x-4 mt-6 tablet:mt-0'>
        <div>
          <Link
            className='text-app-text hover:text-app-text-hover focus:underline bg-transparent'
            href={`/logs?uri=${feedUri}&performedBy=${moderator.did}`}
          >
            View Logs
          </Link>
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
