'use client';
import { useEffect, useState } from 'react';
import { ModerationLogs, ModAction } from '@/services/moderation-logs';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Tabs } from '../tab/tab';
import { OptimizedImage } from '../optimized-image';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useToast } from '@/contexts/toast-context';
import { VisualIntent } from '@/enums/styles';
import { LogEntry } from './components/log-entry';
import { Select } from '../input/select';
import { DatePicker } from '../date-picker';

export interface Log {
  id: string;
  feed_did: string;
  action: ModAction;
  created_at: string;
  performed_by: string;
  performed_by_profile: {
    handle: string;
    name: string | null;
  };
  target_user_did: string | null;
  target_user_profile?: {
    handle: string;
    name: string | null;
  };
  target_post_uri: string | null;
  metadata: Record<string, unknown> | null;
}

export const ModerationLogViewer = ({
  feedUri,
  mod,
}: {
  feedUri: string;
  mod: ProfileViewBasic;
}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    actions?: ModAction[];
    dateRange?: { fromDate: string; toDate: string };
  }>({});

  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const data = await ModerationLogs.getFeedModerationLogs(
          feedUri,
          filters
        );
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load moderation logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [feedUri, filters]);

  if (isLoading)
    return (
      <div className='flex h-full justify-center items-center'>
        <LoadingSpinner size='xl' />
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

  const categories = {
    all: logs,
    permissions: logs.filter((l) =>
      ['mod_promote', 'mod_demote'].includes(l.action)
    ),
    posts: logs.filter((l) =>
      ['post_delete', 'post_restore'].includes(l.action)
    ),
    bans: logs.filter((l) => ['user_ban', 'user_unban'].includes(l.action)),
  };

  const tabs = Object.entries(categories).map(([key, logs]) => ({
    title: <>{key.charAt(0).toUpperCase() + key.slice(1)}</>,
    TabContent:
      logs.length === 0 ? (
        <p className='text-app-secondary text-center py-4'>No logs found</p>
      ) : (
        <div className='overflow-auto h-full max-h-[700px] px-4'>
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      ),
  }));

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div>
        <section className='flex flex-col items-center jusify-between w-full'>
          <article className='bg-app-background shadow-sm p-4 flex w-full items-center '>
            <div className='mr-4'>
              {mod.avatar ? (
                <OptimizedImage
                  src={mod.avatar}
                  alt={`${mod.name || mod.handle}'s avatar`}
                  className='w-20 h-w-20 rounded-full border-app-border border'
                />
              ) : (
                <div className='w-20 h-w-20 rounded-full border-app-border border' />
              )}
            </div>
            <div className='flex w-full flex-col justify-between items-start'>
              <div>
                <h3 className='text-sm font-semibold text-app'>
                  {(mod.name as string) || mod.handle}
                </h3>
                <p className='text-xs text-app-secondary'>@{mod.handle}</p>
              </div>
            </div>
          </article>
        </section>
        <Tabs tabs={tabs} />
      </div>
      <div className='flex flex-col space-y-4 p-4 border-l border-l-app-border'>
        <div className='flex flex-col justify-evenly space-y-4'>
          <Select
            id='actions'
            label='Filter By Action'
            value={filters.actions?.join() || ''}
            onChange={(e) => {
              console.log({ e });
              if (!e) {
                return setFilters({});
              }
              return setFilters({
                ...filters,
                actions: [e as ModAction],
              });
            }}
            options={[
              { label: 'All Actions', value: '' },
              { label: 'Post Deleted', value: 'post_delete' },
              { label: 'Post Restored', value: 'post_restore' },
              { label: 'User Banned', value: 'user_ban' },
              { label: 'User Unbanned', value: 'user_unban' },
              { label: 'Moderator Promoted', value: 'mod_promote' },
              { label: 'Moderator Demoted', value: 'mod_demote' },
            ]}
          />
          <DatePicker
            id='dateRange'
            label='Filter By Date'
            value={filters.dateRange || { fromDate: '', toDate: '' }}
            onChange={(range) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: range || undefined,
              }))
            }
            presets={[
              {
                label: 'Today',
                range: {
                  fromDate: new Date().toISOString().split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                },
              },
              {
                label: 'Yesterday',
                range: {
                  fromDate: new Date(Date.now() - 86400000)
                    .toISOString()
                    .split('T')[0],
                  toDate: new Date(Date.now() - 86400000)
                    .toISOString()
                    .split('T')[0],
                },
              },
              {
                label: 'Last 7 Days',
                range: {
                  fromDate: new Date(Date.now() - 604800000)
                    .toISOString()
                    .split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                },
              },
              {
                label: 'Last Month',
                range: {
                  fromDate: new Date(Date.now() - 2592000000)
                    .toISOString()
                    .split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
