import { ReactNode } from 'react';

export type ModalProps = {
  id: string;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};
