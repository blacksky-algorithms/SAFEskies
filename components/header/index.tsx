import { PropsWithChildren } from 'react';
import { UserButton } from '@/components/user-button';

export const Header = ({ children }: PropsWithChildren) => {
  return (
    <header className='w-full   border-b border-gray-800 px-4 py-3 flex items-center justify-between'>
      <h1 className='text-lg font-bold'>Feed Moderator</h1>
      {children}
      <div className='flex items-center space-x-4'>
        <UserButton />
      </div>
    </header>
  );
};
