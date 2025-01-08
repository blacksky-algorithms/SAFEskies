'use client';

import { FormEvent, useState } from 'react';
import { Button } from '.';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';

export const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { closeModalInstance } = useModal();

  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/log-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to logout');
      }
      router.push('/');

      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      closeModalInstance(MODAL_INSTANCE_IDS.SIDE_DRAWER);
    }
  };

  return (
    <Button type='button' onClick={handleClick} disabled={isLoggingOut}>
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </Button>
  );
};
