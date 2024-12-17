'use client';

import { signInWithBluesky } from '@/repos/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';

export const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');

  const [state, setState] = useState({
    handle: '',
    isSubmitting: false,
    error: null as string | null,
  });

  useEffect(() => {
    const sanitizedHandle = state.handle.replace('@', '');
    if (sanitizedHandle !== state.handle) {
      setState((prevState) => ({ ...prevState, handle: sanitizedHandle }));
    }
  }, [state.handle]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      handle: event.target.value,
      error: null, // Reset error when user starts typing
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!state.handle.trim()) {
      setState((prevState) => ({
        ...prevState,
        error: 'Handle is required',
      }));
      return;
    }

    setState((prevState) => ({ ...prevState, isSubmitting: true }));

    try {
      const url: string = await signInWithBluesky(state.handle.trim());
      router.push(url);
    } catch (err) {
      setState((prevState) => ({
        ...prevState,
        isSubmitting: false,
        error: 'Failed to sign in. Please try again.',
      }));
      console.error(err);
    } finally {
      setState((prevState) => ({
        ...prevState,
        isSubmitting: false,
      }));
    }
  };

  return (
    <section className='w-full'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        <div>
          <label htmlFor='handle' className='block text-sm font-medium'>
            Bluesky Handle
          </label>
          <div className='mt-2'>
            <Input
              id='handle'
              name='handle'
              type='text'
              placeholder='handle.bsky.social'
              value={state.handle}
              onChange={handleChange}
              aria-invalid={!!state.error}
              aria-describedby='handle-error'
            />
            {state.error && (
              <p id='handle-error' className='mt-1 text-sm text-red-500'>
                {state.error}
              </p>
            )}
          </div>
        </div>
        <Button
          type='submit'
          submitting={state.isSubmitting}
          disabled={state.isSubmitting || !state.handle.trim()}
        >
          Sign in with Bluesky
        </Button>
        {errorMessage && (
          <p style={{ color: 'red' }}>{decodeURIComponent(errorMessage)}</p>
        )}
      </form>
    </section>
  );
};
