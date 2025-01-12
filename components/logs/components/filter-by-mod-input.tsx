import { Select } from '@/components/input/select';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { useLogs } from '@/hooks/useLogs';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { useEffect, useState } from 'react';

interface Props {
  filters: ReturnType<typeof useLogs>['filters'];
  updateFilter: (
    filters: Partial<ReturnType<typeof useLogs>['filters']>
  ) => void;
}

export const FilterByModInput = ({ filters, updateFilter }: Props) => {
  const { closeModalInstance, isOpen } = useModal();
  const isFiltersModalOpen = isOpen(MODAL_INSTANCE_IDS.LOG_FILTERS);
  const [state, setState] = useState<{
    mods: ProfileViewBasic[];
    error: string | null;
  }>({ mods: [], error: null });

  useEffect(() => {
    async function loadModerators() {
      try {
        const response = await fetch('/api/moderators');
        if (!response.ok) {
          throw new Error('Failed to fetch moderators');
        }
        const data = await response.json();
        setState({ mods: data.moderators, error: null });
      } catch (error) {
        console.error('Error fetching moderators:', error);
        setState({
          mods: [],
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch moderators',
        });
      }
    }

    loadModerators();
  }, []);

  return (
    <Select
      id='performedBy'
      label='Filter By Actor'
      value={filters.performedBy || ''}
      onChange={(performedBy) => {
        updateFilter({ performedBy });
        if (isFiltersModalOpen) {
          closeModalInstance(MODAL_INSTANCE_IDS.LOG_FILTERS);
        }
      }}
      options={[
        { label: 'All Actors', value: '' },
        ...state.mods.map((mod) => ({
          label: mod.displayName || mod.handle,
          value: mod.did,
        })),
      ]}
    />
  );
};
