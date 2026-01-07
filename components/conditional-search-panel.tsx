'use client';

import { usePathname } from 'next/navigation';
import { SearchPanel } from '@/components/search-panel';
import { LogFilters } from '@/components/logs/components/log-filters';
import { User } from '@/lib/types/user';
import { useMemo } from 'react';

interface ConditionalSearchPanelProps {
  user: User | null;
}

export const ConditionalSearchPanel = ({ user }: ConditionalSearchPanelProps) => {
  const pathname = usePathname();

  // Derive panel content from props - no need for effect + state
  const panelContent = useMemo((): 'search' | 'logs' | null => {
    const isLogsRoute = pathname?.startsWith('/logs');
    const hasUser = !!user;

    if (!hasUser) {
      return null;
    } else if (isLogsRoute) {
      return 'logs';
    } else {
      return 'search';
    }
  }, [pathname, user]);
  
  // Return null during server-side rendering and until client hydration
  if (!panelContent) {
    return null;
  }
  
  if (panelContent === 'logs') {
    return (
      <div className="p-4 space-y-4">
        <LogFilters />
      </div>
    );
  }
  
  return <SearchPanel />;
};
