'use client';
export const dynamic = 'force-dynamic';

import { Login } from '@/components/login';

export default async function page() {
  return (
    <section className='flex items-center justify-center w-full h-full px-4'>
      <Login />
    </section>
  );
}
