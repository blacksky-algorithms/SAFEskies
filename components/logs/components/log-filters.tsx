'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Select } from '@/components/input/select';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/button';
import { memo, useState } from 'react';
// import { FilterByModInput } from './filter-by-mod-input';
import { BSUserSearch } from '@/components/bs-user-search/bs-user-search';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const LogFilters = memo(() => {
  const searchParams = useSearchParams();
  const uri = searchParams.get('uri') || '';
  const router = useRouter();
  const { closeModalInstance, isOpen } = useModal();

  const [actorDisplayName, setActorDisplayName] = useState('Search Bluesky');

  const isFiltersModalOpen = isOpen(MODAL_INSTANCE_IDS.LOG_FILTERS);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/logs?${params.toString()}`);
    if (isFiltersModalOpen) {
      closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
    }
  };

  const clearFilters = () => {
    router.push(`/logs?uri=${uri}`);
    setActorDisplayName('Search Bluesky');
    if (isFiltersModalOpen) {
      closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
    }
  };

  const isFilterActive = Array.from(searchParams.keys()).length > 0;

  return (
    <div className='flex flex-col justify-evenly space-y-4 pb-10'>
      <Select
        id='sortBy'
        label='Sort By'
        value={searchParams.get('sortBy') || 'descending'}
        onChange={(value) => updateFilter('sortBy', value)}
        options={[
          { label: 'Newest First', value: 'descending' },
          { label: 'Oldest First', value: 'ascending' },
        ]}
      />

      <DatePicker
        id='dateRange'
        label='Filter By Date'
        value={{
          fromDate: searchParams.get('fromDate') || '',
          toDate: searchParams.get('toDate') || '',
        }}
        onChange={({ fromDate, toDate }) => {
          // Update both params at once
          const params = new URLSearchParams(searchParams);
          if (fromDate && toDate) {
            params.set('fromDate', fromDate);
            params.set('toDate', toDate);
          } else {
            params.delete('fromDate');
            params.delete('toDate');
          }
          router.push(`/logs?${params.toString()}`);
          if (isFiltersModalOpen) {
            closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
          }
        }}
        presets
      />

      {/* <FilterByModInput
            performedBy={searchParams.get('performedBy') || ''}
            updateFilter={(filter) =>
              updateFilter('performedBy', filter.performedBy || null)
            }
          /> */}

      <BSUserSearch
        id='targetUser'
        label='Filter By Target User'
        onSelect={(user) => {
          setActorDisplayName(user?.displayName || `@${user.handle}`);
          updateFilter('targetUser', user.did);
        }}
        placeholder={actorDisplayName}
      />

      {/* TODO: implement filter by targetPost */}

      <Select
        id='action'
        label='Filter By Action'
        value={searchParams.get('action') || ''}
        onChange={(action) => updateFilter('action', action || null)}
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

      {clearFilters && (
        <Button disabled={!isFilterActive} onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
});

LogFilters.displayName = 'LogFilters';
