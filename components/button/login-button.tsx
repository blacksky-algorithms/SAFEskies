'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { Button } from '.';

export const LoginButton = () => {
  const router = useRouter();

  // Handle the form submission
  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    router.push(`/oauth/login`);
  };

  return (
    <Button type='button' onClick={handleClick}>
      Login with Bluesky
    </Button>
  );
};
