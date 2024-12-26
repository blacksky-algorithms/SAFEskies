import React from 'react';
import { ModalProvider } from './modal-context';
import { ToastProvider } from './toast-context';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <ModalProvider>{children}</ModalProvider>
    </ToastProvider>
  );
};
