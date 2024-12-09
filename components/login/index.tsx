'use client';

import { signInWithBluesky } from '@/repos/actions';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';

// This is the login page
export const Login = () => {
  const router = useRouter();

  // This is a controlled input
  const [handle, setHandle] = useState('');

  // Remove the @ symbol from the handle
  useEffect(() => {
    setHandle(handle.replace('@', ''));
  }, [handle]);

  // Handle the form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!handle) {
      return;
    }

    // Sign in with Bluesky
    const url: string = await signInWithBluesky(handle);

    // Redirect to the Bluesky login page
    router.push(url);
  };

  return (
    <section className='w-full'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        <div>
          <label htmlFor='handle'>Bluesky Handle</label>
          <div className='mt-2'>
            <Input
              id='handle'
              name='handle'
              type='text'
              placeholder='handle.bsky.social'
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
            />
          </div>
        </div>
        <Button type='submit'>Sign in with Bluesky</Button>
      </form>
    </section>
  );
};
