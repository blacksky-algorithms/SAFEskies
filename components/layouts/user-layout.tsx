import { User } from '@/types/user';
import { BaseLayout } from './base-layout';
import { SideDrawerContent } from '../side-drawer/side-drawer-content';

export const UserLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => {
  return (
    <BaseLayout user={user} sideContent={<SideDrawerContent user={user} />}>
      {children}
    </BaseLayout>
  );
};
