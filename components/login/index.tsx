'use client';

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
    const sanitizedHandle = state.handle.replace('@', '').toLowerCase();
    if (sanitizedHandle !== state.handle) {
      setState((prevState) => ({ ...prevState, handle: sanitizedHandle }));
    }
  }, [state.handle]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      handle: event.target.value,
      error: null,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedHandle = state.handle.trim();
    if (!trimmedHandle) {
      setState((prev) => ({ ...prev, error: 'Handle is required' }));
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: trimmedHandle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign in');
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Login error:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sign in. Please try again.',
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };
  return (
    <section className='w-full max-w-2xl'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        <Input
          id='handle'
          name='handle'
          type='text'
          placeholder='handle.bsky.social'
          value={state.handle}
          onChange={handleChange}
          aria-invalid={!!state.error}
          aria-describedby='handle-error'
          error={state.error || undefined}
          label='Bluesky Handle'
        />
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
