import React from 'react';
import { PublicSideDrawerContent } from '@/components/public-side-drawer-content';

export const SideDrawerContent = () => {
  // TODO: differentiate between public and admin side drawer content
  return (
    <aside className='hidden lg:block lg:w-80 border-r border-gray-800'>
      <div className='p-4 h-full'>
        <PublicSideDrawerContent />
      </div>
    </aside>
  );
};
