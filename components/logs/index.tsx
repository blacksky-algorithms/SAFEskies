'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '@/components/tab/tab';
import { useLogs } from '@/hooks/useLogs';
import { LogEntry } from './components/log-entry';
import { LogFilters } from './components/log-filters';
import { LogsWrapper } from './components/logs-header';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { Modal } from '@/components/modals';

export const Logs = () => {
  const { logs, isLoading, error } = useLogs();

  // Organize logs into categories
  const categories = {
    all: logs.filter((log) => log.action !== 'user_ban'),
    posts: logs.filter((log) =>
      ['post_delete', 'post_restore'].includes(log.action)
    ),
    bans: logs.filter((log) => ['user_ban', 'user_unban'].includes(log.action)),
  };

  // Render the logs within categorized tabs
  const renderTabs = () => {
    const tabs = Object.entries(categories).map(([key, logs]) => ({
      title: <>{key.charAt(0).toUpperCase() + key.slice(1)}</>,
      TabContent: logs.length ? (
        <div className='px-4 h-full overflow-auto max-h-page pt-4 pb-56'>
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <p className='text-app-secondary text-center py-4'>No logs found</p>
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
      return (
        <div className='text-app-error text-center py-4'>
          <p>Error loading logs: {error}</p>
        </div>
      );
    }

    return <Tabs data={tabs} />;
  };

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 h-full'>
        <div className='col-span-2'>
          <LogsWrapper />
          {renderTabs()}
        </div>
        <div className='hidden tablet:flex flex-col space-y-4 p-4 border-l border-l-app-border'>
          <LogFilters />
        </div>
      </div>
      <Modal
        id={MODAL_INSTANCE_IDS.LOG_FILTERS}
        title='Filter Logs'
        size='full'
      >
        <div className='flex flex-col space-y-4 p-4 overflow-auto max-h-page'>
          <LogFilters />
        </div>
      </Modal>
    </>
  );
};
