import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';
// import { Input } from '@/components/input';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Button } from '@/components/button';
import { ModAction } from '@/lib/types/moderation';
import { useLogs } from '@/hooks/useLogs';

interface Props {
  actors?: ProfileViewBasic[];
  filterUpdaters: ReturnType<typeof useLogs>['filterUpdaters'];
  filters: ReturnType<typeof useLogs>['filters'];
}

export const LogFilters = ({ actors, filterUpdaters, filters }: Props) => {
  const isFilterActive = Object.values(filters).some((filter) => {
    return filter !== 'ascending' && filter !== 'descending' && !!filter;
  });
  // closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
  const {
    updateAction,
    updateDateRange,
    updatePerformedBy,
    // updateTargetPost,
    // onTargetPostFilterChange,
    updateSortBy,
    clearFilters,
  } = filterUpdaters;
  return (
    <div className='flex flex-col justify-evenly space-y-4'>
      {updateSortBy && (
        <Select
          id='sortBy'
          label='Sort By'
          value={filters.sortBy || 'descending'}
          onChange={(value) =>
            updateSortBy(value as 'ascending' | 'descending')
          }
          options={[
            { label: 'Newest First', value: 'descending' },
            { label: 'Oldest First', value: 'ascending' },
          ]}
        />
      )}
      {updateDateRange && (
        <DatePicker
          id='dateRange'
          label='Filter By Date'
          value={filters.dateRange || { fromDate: '', toDate: '' }}
          onChange={updateDateRange}
          presets
        />
      )}
      {updatePerformedBy && actors && (
        <Select
          id='performedBy'
          label='Filter By Actor'
          value={filters.performedBy || ''}
          onChange={(value) => updatePerformedBy(value)}
          options={[
            { label: 'All Actors', value: '' },
            ...actors.map((actor) => ({
              label: actor.displayName || actor.handle,
              value: actor.handle,
            })),
          ]}
        />
      )}
      {updateAction && (
        <Select
          id='action'
          label='Filter By Action'
          value={filters.action || ''}
          onChange={(selectedAction) =>
            updateAction(selectedAction as ModAction)
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
       {updateTargetPost && (
        <Input
          id='targetUser'
          label='Filter By Target User'
          value={filters.targetUser || ''}
          onChange={(e) => updateTargetPost(e.target.value)}
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
      {clearFilters && (
        <Button disabled={!isFilterActive} onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};
