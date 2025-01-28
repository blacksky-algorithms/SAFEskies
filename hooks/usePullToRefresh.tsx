import { useState, useRef, RefObject } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

interface PullToRefreshResult {
  containerRef: RefObject<HTMLDivElement>;
  isRefreshing: boolean;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 50,
}: PullToRefreshOptions): PullToRefreshResult => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    containerRef.current.dataset.touchStartY = e.touches[0].clientY.toString();
  };

  const handleTouchMove = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (isRefreshing) return;

    const touchStartY = parseFloat(
      containerRef.current.dataset.touchStartY || '0'
    );
    const deltaY = e.touches[0].clientY - touchStartY;

    if (deltaY > threshold && containerRef.current.scrollTop === 0) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return {
    containerRef,
    isRefreshing,
    handleTouchStart,
    handleTouchMove,
  };
};
