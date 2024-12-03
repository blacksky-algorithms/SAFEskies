import React, { PropsWithChildren } from 'react';

interface LiveRegionProps {
  role?: 'status' | 'alert'; // 'status' for polite updates, 'alert' for urgent messages
  ariaLive?: 'polite' | 'assertive'; // polite for less critical updates, assertive for important updates
  ariaAtomic?: boolean; // Ensures the entire message is announced
  className?: string;
}

export const LiveRegion = ({
  children,
  role = 'status',
  ariaLive = 'polite',
  ariaAtomic = true,
  className = '',
}: PropsWithChildren<LiveRegionProps>) => {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={className}
    >
      {children}
    </div>
  );
};
