import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';
// import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { ModAction } from '@/lib/types/moderation';
import { useLogs } from '@/hooks/useLogs';
import { memo, useRef } from 'react';
import { FilterByModInput } from './filter-by-mod-input';
import { BSUserSearch } from '@/components/bs-user-search/bs-user-search';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

interface Props {
  filterByMod: boolean;
  filters: ReturnType<typeof useLogs>['filters'];
  updateFilter: (
    filters: Partial<ReturnType<typeof useLogs>['filters']>
  ) => void;
  clearFilters: () => void;
}

export const LogFilters = memo(
  ({ filterByMod, filters, updateFilter, clearFilters }: Props) => {
    const isFilterActive = Object.values(filters).some((filter) => {
      return filter !== 'ascending' && filter !== 'descending' && !!filter;
    });

    const filtersDisplayDataRef = useRef({ targetedUserName: '' });

    const { closeModalInstance, isOpen } = useModal();

    const isFiltersModalOpen = isOpen(MODAL_INSTANCE_IDS.LOG_FILTERS);
    return (
      <div className='flex flex-col justify-evenly space-y-4'>
        <Select
          id='sortBy'
          label='Sort By'
          value={filters.sortBy || 'descending'}
          onChange={(value) => {
            updateFilter({ sortBy: value as 'ascending' | 'descending' });
            if (isFiltersModalOpen) {
              closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
            }
          }}
          options={[
            { label: 'Newest First', value: 'descending' },
            { label: 'Oldest First', value: 'ascending' },
          ]}
        />
        <DatePicker
          id='dateRange'
          label='Filter By Date'
          value={filters.dateRange || { fromDate: '', toDate: '' }}
          onChange={(dateRange) => {
            updateFilter({ dateRange });
            if (isFiltersModalOpen) {
              closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
            }
          }}
          presets
        />
        {filterByMod ? (
          <FilterByModInput filters={filters} updateFilter={updateFilter} />
        ) : null}
        <BSUserSearch
          id='targetUser'
          label='Filter By Target User'
          onSelect={(user) => {
            filtersDisplayDataRef.current = {
              targetedUserName: user?.displayName || `@${user.handle}`,
            };
            updateFilter({ targetUser: user.did });
          }}
          placeholder={filtersDisplayDataRef.current.targetedUserName}
        />

        <Select
          id='action'
          label='Filter By Action'
          value={filters.action || ''}
          onChange={(action) => {
            updateFilter({ action: (action as ModAction) || null });
            if (isFiltersModalOpen) {
              closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
            }
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

        {/*
      {onTargetPostFilterChange && (
        <Input
          id='targetPost'
          label='Filter By Target Post'
          value={filters.targetPost || ''}
          onChange={(e) => onTargetPostFilterChange(e.target.value)}
        />
      )} */}
        {clearFilters && (
          <Button
            disabled={!isFilterActive}
            onClick={() => {
              clearFilters();
              filtersDisplayDataRef.current = { targetedUserName: '' };
              if (isFiltersModalOpen) {
                closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
              }
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }
);

LogFilters.displayName = 'LogFilters';
