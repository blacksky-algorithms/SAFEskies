'use client';

import { FormEvent } from 'react';
import { Button } from '.';
import { signOutOfBlueSky } from '@/repos/actions';

// This is the logout button
export const LogoutButton = () => {
  // Handle the form submission
  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Sign out
    await signOutOfBlueSky();

    window.location.href = '/';
  };

  return (
    <Button type='button' onClick={handleClick}>
      Logout
    </Button>
  );
};
