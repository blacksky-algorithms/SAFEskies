import { Header } from '@/components/header';
import { SideDrawer } from '@/components/side-drawer';
import { PropsWithChildren } from 'react';
import { PublicSideDrawerContent } from '../public-side-drawer-content';
import { User } from '@/types/user';

export const PublicLayout = ({
  children,
  user,
}: PropsWithChildren<{ user: User | null }>) => {
  return (
    <div className='grid grid-rows-layout min-h-screen'>
      {/* Header */}
      <header className='row-start-1 row-end-2 col-span-full sticky top-0 h-20 bg-app-background z-10 border-b border-b-app-border'>
        <Header user={user} />
      </header>

      {/* Page Content */}
      <div className='row-start-2 row-end-3 grid grid-cols-1 tablet:grid-cols-12  mx-auto w-fullborder-x border-app-border'>
        {/* Left Content */}
        <aside className='hidden tablet:block tablet:col-span-3 desktop:col-span-1 bg-theme-secondary sticky top-20 h-[calc(100vh-80px)]'>
          <PublicSideDrawerContent user={user} />
        </aside>

        {/* Main Content */}
        <main className='col-span-full tablet:col-span-9 desktop:col-span-10 bg-app-background overflow-auto h-[calc(100vh-80px)] relative'>
          {children}
        </main>

        {/* Right Content */}
        <aside
          aria-hidden={true}
          className='hidden desktop:block  desktop:col-span-1 bg-theme-secondary sticky top-20 h-[calc(100vh-80px)]'
        >
          {/* Placeholder - un aria-hide when in use */}
        </aside>
      </div>
      {/* Page Content */}

      {/* Modals and Drawers */}
      <SideDrawer user={user} />
    </div>
  );
};
