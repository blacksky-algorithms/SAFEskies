'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '@/components/tab/tab';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { LogEntry } from './components/log-entry';
import { LogFilters } from './components/log-filters';
import { Log } from '@/lib/types/logs';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Modal } from '@/components/modals';
import { LogsWrapper } from './components/logs-header';
import { useLogs } from '@/hooks/useLogs';

export const Logs = ({
  targetedProfile,
  isLoading,
  error,
  filters,
  updateFilter,
  clearFilters,
  logs = [],
}: {
  targetedProfile?: ProfileViewBasic;
  isLoading: boolean;
  error: string | null;
  filters: ReturnType<typeof useLogs>['filters'];
  updateFilter: (
    filters: Partial<ReturnType<typeof useLogs>['filters']>
  ) => void;
  clearFilters: () => void;
  logs: Log[];
}) => {
  const { toast } = useToast();

  // Organize logs into categories
  const categories = {
    all: logs.filter((log) => log.action !== 'user_ban'),
    posts: logs.filter((log) =>
      ['post_delete', 'post_restore'].includes(log.action)
    ),
    bans: logs.filter((log) => ['user_ban', 'user_unban'].includes(log.action)),
  };

  // Tab rendering logic
  const renderTabs = () => {
    const tabs = Object.entries(categories).map(([key, logs]) => ({
      title: <>{key.charAt(0).toUpperCase() + key.slice(1)}</>,
      TabContent:
        logs.length === 0 ? (
          <p className='text-app-secondary text-center py-4'>No logs found</p>
        ) : (
          <div className='px-4 h-full overflow-auto max-h-page pt-4 pb-56'>
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        ),
    }));

    if (isLoading) {
      return (
        <div className='flex items-center justify-center p-20 h-full'>
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      toast({
        title: 'Error',
        message: error,
        intent: VisualIntent.Error,
      });
    }

    return <Tabs data={tabs} />;
  };

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 h-full'>
        <div className='col-span-2'>
          <LogsWrapper targetedProfile={targetedProfile} />
          {renderTabs()}
        </div>
        <div className='hidden tablet:flex flex-col space-y-4 p-4 border-l border-l-app-border'>
          <LogFilters
            filterByMod={!targetedProfile}
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
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
            filterByMod={!targetedProfile}
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
          />
        </div>
      </Modal>
    </>
  );
};
