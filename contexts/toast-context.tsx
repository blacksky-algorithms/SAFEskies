'use client';
import { createContext, useState, ReactNode, useContext } from 'react';
import { Toast } from '@/components/toast';
import { VisualIntent } from '@/enums/styles';

interface ToastContextType {
  toast: (options: {
    message: string;
    title?: string;
    intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  }) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>();
  const [intent, setIntent] = useState<
    Exclude<VisualIntent, VisualIntent.TextButton>
  >(VisualIntent.Primary);

  const toast = ({
    message,
    title,
    intent = VisualIntent.Primary,
  }: {
    message: string;
    title?: string;
    intent?: Exclude<VisualIntent, VisualIntent.TextButton>;
  }) => {
    setMessage(message);
    setTitle(title);
    setIntent(intent);
    setShow(true);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast
        show={show}
        message={message}
        title={title}
        intent={intent}
        onClose={() => setShow(false)}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
