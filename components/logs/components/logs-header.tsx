'use client';

// import { useSearchParams } from 'next/navigation';
import { OptimizedImage } from '@/components/optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { IconButton } from '@/components/button/icon-button';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useModal } from '@/contexts/modal-context';

export const LogsWrapper = ({
  targetedProfile,
}: {
  targetedProfile?: ProfileViewBasic;
}) => {
  const { openModalInstance } = useModal();
  // TODO
  // const searchParams = useSearchParams();
  // const showProfileHeaderOnLogs =
  //   searchParams.has('targetUser') || searchParams.has('performedBy');
  // console.log({ showProfileHeaderOnLogs });
  return (
    <section className='flex tablet:flex-col items-center justify-end tablet:jusify-between w-full pr-4'>
      {targetedProfile && (
        <article className='bg-app-background shadow-sm p-4 flex w-full items-center '>
          <div className='mr-4'>
            {targetedProfile.avatar ? (
              <OptimizedImage
                src={targetedProfile.avatar}
                alt={`${
                  targetedProfile.name || targetedProfile.handle
                }'s avatar`}
                className='w-20 h-w-20 rounded-full border-app-border border'
              />
            ) : (
              <div className='w-20 h-w-20 rounded-full border-app-border border' />
            )}
          </div>
          <div className='flex w-full flex-col justify-between items-start'>
            <div>
              <h3 className='text-sm font-semibold text-app'>
                {(targetedProfile.name as string) || targetedProfile.handle}
              </h3>
              <p className='text-xs text-app-secondary'>
                @{targetedProfile.handle}
              </p>
            </div>
          </div>
        </article>
      )}
      <div className='flex tablet:hidden'>
        <IconButton
          className='h-10 w-10'
          icon='AdjustmentsHorizontalIcon'
          onClick={() => openModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS)}
        />
      </div>
    </section>
  );
};
