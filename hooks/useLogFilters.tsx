import { LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { useState } from 'react';

export const useLogFilters = () => {
  const [filters, setFilters] = useState<LogFilters>({
    sortBy: 'descending',
  });

  const filterUpdaters = {
    updateAction: (action: ModAction) =>
      setFilters((prev) => ({ ...prev, action: action || null })),

    updateDateRange: (range: { fromDate: string; toDate: string }) =>
      setFilters((prev) => ({ ...prev, dateRange: range })),

    updatePerformedBy: (performedBy: string) =>
      setFilters((prev) => ({ ...prev, performedBy })),

    updateTargetUser: (targetUser: string) =>
      setFilters((prev) => ({ ...prev, targetUser })),

    updateTargetPost: (targetPost: string) =>
      setFilters((prev) => ({ ...prev, targetPost })),

    updateSortBy: (sortBy: 'ascending' | 'descending') =>
      setFilters((prev) => ({ ...prev, sortBy })),

    clearFilters: () => setFilters({ sortBy: 'descending' }),
  };

  return {
    filters,
    filterHandlers: {
      onActionFilterChange: filterUpdaters.updateAction,
      onDateFilterChange: filterUpdaters.updateDateRange,
      onPerformedByFilterChange: filterUpdaters.updatePerformedBy,
      onTargetUserFilterChange: filterUpdaters.updateTargetUser,
      onTargetPostFilterChange: filterUpdaters.updateTargetPost,
      onSortByFilterChange: filterUpdaters.updateSortBy,
      onClearFilters: filterUpdaters.clearFilters,
    },
  };
};
