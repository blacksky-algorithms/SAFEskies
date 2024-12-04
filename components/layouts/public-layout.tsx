import { Header } from '@/components/header';
import { SideDrawer } from '@/components/side-drawer';
import { PropsWithChildren } from 'react';
import { PublicSideDrawerContent } from '../public-side-drawer-content';

export const PublicLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='grid grid-rows-layout min-h-screen max-w-screen'>
      <header className='row-start-1 row-end-2 col-span-full sticky top-0 h-app-post-header-height bg-app-background z-10'>
        <Header />
      </header>

      {/* Page Content */}
      <div className='row-start-2 row-end-3 grid grid-cols-1 tablet:grid-cols-5 desktop:grid-cols-5 max-w-screen-desktop mx-auto w-full h-app-page-page'>
        {/* Left Content */}
        <aside className='hidden h-app-page-page tablet:block tablet:col-span-2 desktop:col-span-1 overflow-auto'>
          <PublicSideDrawerContent />
        </aside>

        {/* Main Content */}
        <main className='col-span-full h-app-page-page tablet:col-span-3 desktop:col-span-3 bg-app-background  overflow-auto'>
          {children}
        </main>

        {/* Right Content */}
        <aside className='hidden desktop:block h-app-page-page desktop:col-span-1 overflow-auto'>
          {/* Placeholder */}
        </aside>
      </div>

      {/* Modals and Drawers */}
      <SideDrawer />
    </div>
  );
};
