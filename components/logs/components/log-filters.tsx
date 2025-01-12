import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';
// import { Input } from '@/components/input';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { Button } from '@/components/button';
import { ModAction } from '@/lib/types/moderation';
import { useLogs } from '@/hooks/useLogs';
import { memo } from 'react';

interface Props {
  modActors?: ProfileViewBasic[];
  filters: ReturnType<typeof useLogs>['filters'];
  updateFilter: (
    filters: Partial<ReturnType<typeof useLogs>['filters']>
  ) => void;
  clearFilters: () => void;
}

export const LogFilters = memo(
  ({ modActors, filters, updateFilter, clearFilters }: Props) => {
    const isFilterActive = Object.values(filters).some((filter) => {
      return filter !== 'ascending' && filter !== 'descending' && !!filter;
    });
    // closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);

    return (
      <div className='flex flex-col justify-evenly space-y-4'>
        <Select
          id='sortBy'
          label='Sort By'
          value={filters.sortBy || 'descending'}
          onChange={(value) =>
            updateFilter({ sortBy: value as 'ascending' | 'descending' })
          }
          options={[
            { label: 'Newest First', value: 'descending' },
            { label: 'Oldest First', value: 'ascending' },
          ]}
        />
        <DatePicker
          id='dateRange'
          label='Filter By Date'
          value={filters.dateRange || { fromDate: '', toDate: '' }}
          onChange={(dateRange) => updateFilter({ dateRange })}
          presets
        />
        {modActors && (
          <Select
            id='performedBy'
            label='Filter By Actor'
            value={filters.performedBy || ''}
            onChange={(performedBy) => updateFilter({ performedBy })}
            options={[
              { label: 'All Actors', value: '' },
              ...modActors.map((actor) => ({
                label: actor.displayName || actor.handle,
                value: actor.did,
              })),
            ]}
          />
        )}
        <Select
          id='action'
          label='Filter By Action'
          value={filters.action || ''}
          onChange={(action) =>
            updateFilter({ action: (action as ModAction) || null })
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
  }
);

LogFilters.displayName = 'LogFilters';
