import { Header } from '@/components/header';
import { SideDrawerContent } from '@/components/side-drawer-content';
import { Footer } from '@/components/footer';
import { SideDrawer } from '@/components/side-drawer';
import { PropsWithChildren } from 'react';
import { GenericErrorModal } from '@/components/modals/generic-error-modal';

export const PublicLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex flex-col min-h-screen  '>
      <Header />
      <div className='flex flex-1'>
        <SideDrawerContent />
        <main className='flex-1 px-4 py-6'>{children}</main>
      </div>
      <Footer />
      {/* Modals and Drawers */}
      <SideDrawer />
    </div>
  );
};
