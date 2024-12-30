'use client';
import { ModAction } from '@/services/moderation-logs';
import { format } from 'date-fns';
import cc from 'classcat';
import { Log } from '..';

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cc([
      'rounded-lg border border-app-border bg-app-background shadow-sm',
      className,
    ])}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cc(['px-6 py-4', className])}>{children}</div>;

const ActionLabel: Record<ModAction, string> = {
  post_delete: 'Post Deleted',
  post_restore: 'Post Restored',
  user_ban: 'User Banned',
  user_unban: 'User Unbanned',
  mod_promote: 'Moderator Added',
  mod_demote: 'Moderator Removed',
};

export const LogEntry = ({ log }: { log: Log }) => (
  <Card className='mb-4'>
    <CardContent className='pt-6'>
      <div className='flex justify-between mb-2'>
        <span className='font-semibold'>{ActionLabel[log.action]}</span>
        <span className='text-app-secondary text-sm'>
          {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
        </span>
      </div>

      <p className='text-sm text-app-secondary'>
        By: @{log.performed_by_profile.handle}
      </p>

      {log.target_user_profile && (
        <p className='text-sm text-app-secondary'>
          Target User: @{log.target_user_profile.handle}
        </p>
      )}

      {log.target_post_uri && (
        <p className='text-sm text-app-secondary truncate'>
          Post: {log.target_post_uri}
        </p>
      )}

      {log.metadata && (
        <pre className='mt-2 text-xs bg-app-secondary-hover p-2 rounded'>
          {JSON.stringify(log.metadata, null, 2)}
        </pre>
      )}
    </CardContent>
  </Card>
);
