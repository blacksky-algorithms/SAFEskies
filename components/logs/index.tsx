'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '@/components/tab/tab';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { LogEntry } from './components/log-entry';
import { LogFilters } from './components/log-filters';
import { AdminLog } from '@/lib/types/logs';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Modal } from '@/components/modals';
import { LogsWrapper } from './components/logs-header';
import { useLogs } from '@/hooks/useLogs';

export const Logs = ({
  targetedProfile,
  categories,
  isLoading,
  error,
  moderators,
  filterUpdaters,
  filters,
}: {
  targetedProfile?: ProfileViewBasic;
  categories: Record<string, AdminLog[]>;
  isLoading: boolean;
  error: string | null;
  moderators?: ProfileViewBasic[];
  filterUpdaters: ReturnType<typeof useLogs>['filterUpdaters'];
  filters: ReturnType<typeof useLogs>['filters'];
}) => {
  const { toast } = useToast();

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

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 h-full'>
        <div className='col-span-2 '>
          <LogsWrapper targetedProfile={targetedProfile} />
          <Tabs tabs={tabs} />
        </div>
        <div className='hidden tablet:flex flex-col space-y-4 p-4 border-l border-l-app-border'>
          <LogFilters
            filterUpdaters={filterUpdaters}
            actors={moderators}
            filters={filters}
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
            filterUpdaters={filterUpdaters}
            actors={moderators}
            filters={filters}
          />
        </div>
      </Modal>
    </>
  );
};
