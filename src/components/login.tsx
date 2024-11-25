'use client';

import { useRouter } from 'next/router';
import { createOAuthClient } from '@/utils';
import { useEffect, useState } from 'react';

const Login = () => {
  // const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('');

  const handleLogin = async () => {
    try {
      const client = await createOAuthClient();
      const res = await client.signIn(handle, {
        state: 'login',
      });
      console.log({ res });
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold'>Login to Your App</h1>
      <form>
        <label className='block mt-4'>Handle</label>
        <input
          type='text'
          placeholder='Handle'
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className='border border-gray-300 rounded px-4 py-2 mt-4'
        />
      </form>
      <button
        onClick={handleLogin}
        className='bg-blue-500 text-white px-4 py-2 rounded mt-4'
      >
        Login with Bluesky
      </button>
      {error && <p className='text-red-500 mt-4'>{error}</p>}
    </div>
  );
};

export default Login;
