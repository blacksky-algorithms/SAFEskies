// app/components/layouts/base-layout.tsx
import { Header } from '@/components/header';
import { SideDrawer } from '@/components/side-drawer';
import { User } from '@/types/user';
import { PropsWithChildren } from 'react';

interface BaseLayoutProps {
  user: User | null;
  sideContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const BaseLayout = ({
  children,
  user,
  sideContent,
}: // rightContent,
PropsWithChildren<BaseLayoutProps>) => {
  return (
    <div className='grid grid-rows-layout min-h-screen'>
      <header className='row-start-1 row-end-2 col-span-full sticky top-0 h-app-page-header bg-app-background z-10 border-b border-b-app-border'>
        <Header user={user} />
      </header>
      <div className='row-start-2 row-end-3 grid grid-cols-1 tablet:grid-cols-12 mx-auto w-full'>
        <aside className='tablet:block hidden tablet:col-span-3 desktop:col-span-3 bg-theme-secondary sticky top-20 h-full max-h-page border-r border-r-app-border'>
          {sideContent}
        </aside>
        <main className='col-span-full tablet:col-span-9 desktop:col-span-9 bg-app-background overflow-hidden h-full max-h-page relative'>
          {children}
        </main>
      </div>
      <SideDrawer user={user} />
    </div>
  );
};
