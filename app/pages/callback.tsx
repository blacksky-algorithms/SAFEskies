import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createOAuthClient } from '@/utils';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const client = await createOAuthClient();
      const result = await client.init();

      if (result?.session) {
        localStorage.setItem('session', JSON.stringify(result.session));
        router.push('/');
      } else {
        console.error('OAuth session could not be initialized.');
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <h1 className='text-xl font-bold'>Completing Login...</h1>
    </div>
  );
};

export default Callback;
