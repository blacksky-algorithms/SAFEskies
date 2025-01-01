import { ModAction } from '@/services/moderation-logs';
import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';

interface Props {
  filters: {
    actions?: ModAction[];
    dateRange?: { fromDate: string; toDate: string };
  };
  onDateFilterChange: (dateRange: { fromDate: string; toDate: string }) => void;
  onActionFilterChange: (action: string) => void;
}

export const LogFilters = ({
  filters,
  onDateFilterChange,
  onActionFilterChange,
}: Props) => {
  const getLocalDate = (date: Date) => {
    return date.toLocaleDateString('en-CA');
  };

  return (
    <div className='flex flex-col justify-evenly space-y-4'>
      <Select
        id='actions'
        label='Filter By Action'
        value={filters.actions?.join() || ''}
        onChange={onActionFilterChange}
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
        onChange={onDateFilterChange}
        presets={[
          {
            label: 'Today',
            range: {
              fromDate: getLocalDate(new Date()),
              toDate: getLocalDate(new Date()),
            },
          },
          {
            label: 'Yesterday',
            range: {
              fromDate: getLocalDate(new Date(Date.now() - 86400000)),
              toDate: getLocalDate(new Date(Date.now() - 86400000)),
            },
          },
          {
            label: 'Last 7 Days',
            range: {
              fromDate: getLocalDate(new Date(Date.now() - 604800000)),
              toDate: getLocalDate(new Date()),
            },
          },
          {
            label: 'Last Month',
            range: {
              fromDate: getLocalDate(new Date(Date.now() - 2592000000)),
              toDate: getLocalDate(new Date()),
            },
          },
        ]}
      />
    </div>
  );
};
