import { User } from '@/types/user';
import { BaseLayout } from './base-layout';
import { PublicSideDrawerContent } from '../public-side-drawer-content';

export const UserLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => {
  return (
    <BaseLayout
      user={user}
      sideContent={<PublicSideDrawerContent user={user} />}
    >
      {children}
    </BaseLayout>
  );
};
