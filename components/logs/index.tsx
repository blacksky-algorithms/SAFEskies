'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '@/components/tab/tab';
import { OptimizedImage } from '../optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { LogEntry } from './components/log-entry';
import { IconButton } from '@/components/button/icon-button';
import { LogFilters } from './components/log-filters';
import { Log } from '@/lib/types/logs';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Modal } from '@/components/modals';
import { useModal } from '@/contexts/modal-context';
import { ModAction } from '@/lib/types/moderation';

export const Logs = ({
  targetedProfile,
  categories,
  filters,
  isLoading,
  error,
  onActionFilterChange,
  onDateFilterChange,
  onPerformedByFilterChange,
  onTargetUserFilterChange,
  onTargetPostFilterChange,
  onSortByFilterChange,
  onClearFilters,
  moderators,
}: {
  targetedProfile?: ProfileViewBasic;
  categories: Record<string, Log[]>;
  filters: {
    actions?: ModAction[];
    performedBy?: string;
    targetUser?: string;
    targetPost?: string;
    dateRange?: { fromDate: string; toDate: string };
  };
  isLoading: boolean;
  error: string | null;
  onActionFilterChange?: (action: ModAction) => void;
  onDateFilterChange?: (range: { fromDate: string; toDate: string }) => void;
  onPerformedByFilterChange?: (performedBy: string) => void;
  onTargetUserFilterChange?: (targetUser: string) => void;
  onTargetPostFilterChange?: (targetPost: string) => void;
  onSortByFilterChange?: (sortBy: 'ascending' | 'descending') => void;
  onClearFilters?: () => void;
  moderators?: ProfileViewBasic[];
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

  const handleActionFilterModalChange = (action: ModAction) => {
    onActionFilterChange?.(action);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleDateFilterModalChange = (range: {
    fromDate: string;
    toDate: string;
  }) => {
    onDateFilterChange?.(range);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handlePerformedByFilterModalChange = (performedBy: string) => {
    onPerformedByFilterChange?.(performedBy);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleTargetUserFilterModalChange = (targetUser: string) => {
    onTargetUserFilterChange?.(targetUser);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleTargetPostFilterModalChange = (targetPost: string) => {
    onTargetPostFilterChange?.(targetPost);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleSortByFilterModalChange = (
    sortBy: 'ascending' | 'descending'
  ) => {
    onSortByFilterChange?.(sortBy);
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  const handleOnClearFilters = () => {
    onClearFilters?.();
    closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  };

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 h-full'>
        <div className='col-span-2 '>
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
            <div className='flex tablet:hidden  '>
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
            onTargetUserFilterChange={onTargetUserFilterChange}
            onTargetPostFilterChange={onTargetPostFilterChange}
            onPerformedByFilterChange={onPerformedByFilterChange}
            onSortByFilterChange={onSortByFilterChange}
            onClearFilters={onClearFilters}
            moderators={moderators}
          />
        </div>
      </div>
      <Modal
        id={MODAL_INSTANCE_IDS.LOG_FILTERS}
        title='Filter Logs'
        size='full'
      >
        <div className='flex flex-col space-y-4 p-4 overflow-auto max-h-page'>
          <LogFilters
            filters={filters}
            onActionFilterChange={handleActionFilterModalChange}
            onDateFilterChange={handleDateFilterModalChange}
            onTargetUserFilterChange={handleTargetUserFilterModalChange}
            onTargetPostFilterChange={handleTargetPostFilterModalChange}
            onPerformedByFilterChange={handlePerformedByFilterModalChange}
            onSortByFilterChange={handleSortByFilterModalChange}
            onClearFilters={handleOnClearFilters}
            moderators={moderators}
          />
        </div>
      </Modal>
    </>
  );
};
