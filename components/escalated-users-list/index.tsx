'use client';

import React, { useEffect, useState } from 'react';
import { fetchEscalatedUsers } from '@/repos/moderation';
import { LoadingSpinner } from '@/components/loading-spinner';
import { UserCard } from '@/components/user-card';
import { Button } from '@/components/button';
import { VisualIntent } from '@/enums/styles';
import { EscalatedItem } from '@/lib/types/moderation';

interface EscalatedUsersListProps {
  onUserSelect: (item: EscalatedItem) => void;
}

export const EscalatedUsersList = ({ onUserSelect }: EscalatedUsersListProps) => {
  const [state, setState] = useState({
    items: [] as EscalatedItem[],
    loading: true,
    error: null as string | null,
  });
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadEscalatedItems = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await fetchEscalatedUsers();
        setState(prev => ({
          ...prev,
          items: response.items,
          loading: false,
        }));
        setCursor(response.cursor || null);
        setHasMore(response.hasMore ?? !!response.cursor);
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load escalated items',
        }));
      }
    };

    loadEscalatedItems();
  }, []);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetchEscalatedUsers(20, cursor);
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...response.items],
      }));
      setCursor(response.cursor || null);
      setHasMore(response.hasMore ?? !!response.cursor);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (state.loading) {
    return (
      <div className='bg-app-background border border-app-border rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-app mb-4'>
          Escalated Reports
        </h3>
        <div className='flex justify-center items-center py-8'>
          <LoadingSpinner size='md' />
          <span className='ml-3 text-app-secondary'>Loading reported users...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className='bg-app-background border border-app-border rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-app mb-4'>
          Escalated Reports
        </h3>
        <div className='text-center py-8'>
          <p className='text-red-600 mb-2'>Error loading escalated reports</p>
          <p className='text-app-secondary text-sm'>{state.error}</p>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className='bg-app-background border border-app-border rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-app mb-4'>
          Escalated Reports
        </h3>
        <div className='text-center py-8'>
          <p className='text-app-secondary'>No items currently in the escalation queue</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-app-background border border-app-border rounded-lg p-6'>
      <h3 className='text-lg font-semibold text-app mb-4'>
        Escalated Reports ({state.items.length})
      </h3>
      <div className='space-y-3'>
        {state.items.map((item) => (
          <UserCard
            key={item.type === 'post' ? item.postUri : item.did}
            user={item}
            onClick={() => onUserSelect(item)}
            actionText="Click to review"
            badge={{
              text: item.type === 'post' ? 'Reported Post' : 'Reported',
              className: item.type === 'post'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }}
          />
        ))}
      </div>
      {hasMore && (
        <div className='mt-4 flex justify-center'>
          <Button
            intent={VisualIntent.Secondary}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};