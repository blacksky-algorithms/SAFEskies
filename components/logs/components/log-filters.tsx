import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';
// import { Input } from '@/components/input';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Button } from '@/components/button';
import { ModAction } from '@/lib/types/moderation';

interface Props {
  filters: {
    action?: ModAction;
    performedBy?: string;
    targetUser?: string;
    targetPost?: string;
    dateRange?: { fromDate: string; toDate: string };
    sortBy?: 'ascending' | 'descending';
  };
  onDateFilterChange?: (dateRange: {
    fromDate: string;
    toDate: string;
  }) => void;
  onActionFilterChange?: (action: ModAction) => void;
  onPerformedByFilterChange?: (performedBy: string) => void;
  onTargetUserFilterChange?: (targetUser: string) => void;
  onTargetPostFilterChange?: (targetPost: string) => void;
  onSortByFilterChange?: (sortBy: 'ascending' | 'descending') => void;
  onClearFilters?: () => void;
  moderators?: ProfileViewBasic[];
}

export const LogFilters = ({
  filters,
  onActionFilterChange,
  onDateFilterChange,
  onPerformedByFilterChange,
  // onTargetUserFilterChange,
  // onTargetPostFilterChange,
  onSortByFilterChange,
  onClearFilters,
  moderators,
}: Props) => {
  const isFilterActive = Object.values(filters).some((filter) => {
    return filter !== 'ascending' && filter !== 'descending' && !!filter;
  });

  return (
    <div className='flex flex-col justify-evenly space-y-4'>
      {onSortByFilterChange && (
        <Select
          id='sortBy'
          label='Sort By'
          value={filters.sortBy || 'descending'}
          onChange={(value) =>
            onSortByFilterChange(value as 'ascending' | 'descending')
          }
          options={[
            { label: 'Newest First', value: 'descending' },
            { label: 'Oldest First', value: 'ascending' },
          ]}
        />
      )}
      {onDateFilterChange && (
        <DatePicker
          id='dateRange'
          label='Filter By Date'
          value={filters.dateRange || { fromDate: '', toDate: '' }}
          onChange={onDateFilterChange}
          presets
        />
      )}
      {onPerformedByFilterChange && moderators && (
        <Select
          id='performedBy'
          label='Filter By Moderator'
          value={filters.performedBy || ''}
          onChange={(value) => onPerformedByFilterChange(value)}
          options={[
            { label: 'All Moderators', value: '' },
            ...moderators.map((mod) => ({
              label: mod.displayName || mod.handle,
              value: mod.handle,
            })),
          ]}
        />
      )}
      {onActionFilterChange && (
        <Select
          id='action'
          label='Filter By Action'
          value={filters.action || ''}
          onChange={(selectedAction) =>
            onActionFilterChange(selectedAction as ModAction)
          }
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
      )}
      {/*
      // TODO: these need refining - currently tries to fire on each keystroke
       {onTargetUserFilterChange && (
        <Input
          id='targetUser'
          label='Filter By Target User'
          value={filters.targetUser || ''}
          onChange={(e) => onTargetUserFilterChange(e.target.value)}
        />
      )}
      {onTargetPostFilterChange && (
        <Input
          id='targetPost'
          label='Filter By Target Post'
          value={filters.targetPost || ''}
          onChange={(e) => onTargetPostFilterChange(e.target.value)}
        />
      )} */}
      {onClearFilters && (
        <Button disabled={!isFilterActive} onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};
