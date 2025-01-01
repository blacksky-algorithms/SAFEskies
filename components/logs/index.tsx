'use client';

import { ModAction } from '@/services/moderation-logs';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '@/components/tab/tab';
import { OptimizedImage } from '../optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { LogEntry } from './components/log-entry';
import { IconButton } from '@/components/button/icon-button';
import { LogFilters } from './components/log-filters';
import { Log } from '@/types/logs';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Modal } from '@/components/modals';
import { useModal } from '@/contexts/modal-context';

export const Logs = ({
  targetedProfile,
  categories,
  filters,
  isLoading,
  error,
  onActionFilterChange = () => {},
  onDateFilterChange = () => {},
}: {
  targetedProfile?: ProfileViewBasic;
  categories: Record<string, Log[]>;
  filters: {
    actions?: ModAction[];
    dateRange?: { fromDate: string; toDate: string };
  };
  isLoading: boolean;
  error: string | null;
  onActionFilterChange?: (action: string) => void;
  onDateFilterChange?: (range: { fromDate: string; toDate: string }) => void;
}) => {
  const { toast } = useToast();
  const { openModalInstance, closeModalInstance } = useModal();

  if (isLoading)
    return (
      <div className='flex items-center justify-center p-20 h-full'>
        <LoadingSpinner />
      </div>
    );

  if (error) {
    toast({
      title: 'Error',
      message: error,
      intent: VisualIntent.Error,
    });

    return;
  }

  const tabs = Object.entries(categories).map(([key, logs]) => ({
    title: <>{key.charAt(0).toUpperCase() + key.slice(1)}</>,
    TabContent:
      logs.length === 0 ? (
        <p className='text-app-secondary text-center py-4'>No logs found</p>
      ) : (
        <div className='px-4  h-full overflow-auto max-h-page pt-4 pb-56'>
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      ),
  }));

  const handleActionFilterModalChange = (action: string) => {
    onActionFilterChange(action);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleDateFilterModalChange = (range: {
    fromDate: string;
    toDate: string;
  }) => {
    onDateFilterChange(range);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='col-span-2 '>
          <section className='flex tablet:flex-col items-center justify-center tablet:jusify-between w-full pr-4'>
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
                      {(targetedProfile.name as string) ||
                        targetedProfile.handle}
                    </h3>
                    <p className='text-xs text-app-secondary'>
                      @{targetedProfile.handle}
                    </p>
                  </div>
                </div>
              </article>
            )}
            <div className='flex tablet:hidden justify-center'>
              <IconButton
                className='h-10 w-10'
                icon='AdjustmentsHorizontalIcon'
                onClick={() =>
                  openModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS)
                }
              />
            </div>
          </section>
          <Tabs tabs={tabs} />
        </div>
        <div className='hidden tablet:flex flex-col space-y-4 p-4 border-l border-l-app-border'>
          <LogFilters
            filters={filters}
            onActionFilterChange={onActionFilterChange}
            onDateFilterChange={onDateFilterChange}
          />
        </div>
      </div>
      <Modal
        id={MODAL_INSTANCE_IDS.LOG_FILTERS}
        title='Filter Logs'
        size='full'
      >
        <div className='flex flex-col space-y-4 p-4'>
          <LogFilters
            filters={filters}
            onActionFilterChange={handleActionFilterModalChange}
            onDateFilterChange={handleDateFilterModalChange}
          />
        </div>
      </Modal>
    </>
  );
};
