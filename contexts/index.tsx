import React from 'react';
import { ModalProvider } from './modal-context';
import { AuthProvider } from './auth-context';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ModalProvider>{children}</ModalProvider>
    </AuthProvider>
  );
};
