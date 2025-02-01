import { Select } from '@/components/input/select';
import { useEffect, useState } from 'react';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';

interface Props {
  performedBy: string | null;
  updateFilter: (filters: { performedBy: string | null }) => void;
}

export const FilterByModInput = ({ updateFilter, performedBy }: Props) => {
  const [state, setState] = useState<{
    mods: ProfileViewBasic[];
    error: string | null;
  }>({ mods: [], error: null });

  useEffect(() => {
    const loadModerators = async () => {
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
    };

    loadModerators();
  }, []);

  console.log({ state });
  if (!state.mods.length) {
    return null;
  }

  return (
    <Select
      id='performedBy'
      label='Filter By Mod Actor'
      value={performedBy || ''}
      onChange={(performedBy) =>
        updateFilter({ performedBy: performedBy || null })
      }
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
