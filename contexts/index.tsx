'use client';

import React from 'react';
import { ModalProvider } from './modal-context';
import { ToastProvider } from './toast-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,

      // Keep inactive data in memory for 5 minutes
      gcTime: 5 * 60 * 1000,

      refetchOnWindowFocus: false,

      refetchOnMount: false,
    },
  },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ModalProvider>{children}</ModalProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
};
