'use client';

import { FormEvent } from 'react';
import { Button } from '.';
import { useUser } from '@/hooks/useUser';

// This is the logout button
export const LogoutButton = () => {
  const { signOut } = useUser();

  // Handle the form submission
  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Sign out
    await signOut();

    window.location.href = '/';
  };

  return (
    <Button type='button' onClick={handleClick}>
      Logout
    </Button>
  );
};
