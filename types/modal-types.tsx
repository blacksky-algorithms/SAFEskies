import { ReactNode } from 'react';

export type ModalProps = {
  id: string;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  children: ReactNode;
  // isOpen: boolean;
  // closeModalInstance: () => void;
  // title?: string; // Optional title
  // children: ReactNode; // Custom content
  // size?: 'small' | 'medium' | 'large' | 'full'; // Size variants
};
