import React from 'react';
import { ModalProvider } from './modal-context';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ModalProvider>{children}</ModalProvider>;
};
