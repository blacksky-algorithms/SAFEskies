'use client';

import { FormEvent, useState } from 'react';
import { Button } from '.';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/modal-context';
import { MODAL_INSTANCE_IDS } from '@/enums/modals';
import { logOut } from '@/repos/auth';

export const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { closeModalInstance } = useModal();

  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setIsLoggingOut(true);

    try {
      const response = await logOut();

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
