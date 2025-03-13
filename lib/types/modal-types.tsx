import { ReactNode } from 'react';

export type ModalProps = {
  id: string;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  noContentPadding?: boolean;
  fullWidthMobile?: boolean;
  showBackButton?: boolean;
  footer?: ReactNode;
};
