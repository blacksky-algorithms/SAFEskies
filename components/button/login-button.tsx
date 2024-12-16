'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Button } from '.';

export const LoginButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleClick = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await router.push('/oauth/login');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type='button'
      onClick={handleClick}
      submitting={isSubmitting}
      disabled={isSubmitting}
    >
      Login with Bluesky
    </Button>
  );
};
