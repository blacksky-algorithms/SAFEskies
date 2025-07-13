'use client';

import { usePathname } from 'next/navigation';
import { SearchPanel } from '@/components/search-panel';
import { LogFilters } from '@/components/logs/components/log-filters';
import { User } from '@/lib/types/user';
import { useEffect, useState } from 'react';

interface ConditionalSearchPanelProps {
  user: User | null;
}

export const ConditionalSearchPanel = ({ user }: ConditionalSearchPanelProps) => {
  const pathname = usePathname();
  const [panelContent, setPanelContent] = useState<'search' | 'logs' | null>(null);
  
  useEffect(() => {
    // Only set the panel content on the client side to avoid hydration mismatch
    const isLogsRoute = pathname?.startsWith('/logs');
    const hasUser = !!user;
    
    if (!hasUser) {
      setPanelContent(null);
    } else if (isLogsRoute) {
      setPanelContent('logs');
    } else {
      setPanelContent('search');
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
