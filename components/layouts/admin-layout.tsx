import { User } from '@/types/user';
import { BaseLayout } from './base-layout';
import { AdminSideDrawerContent } from '../admin-side-drawer-content';

export const AdminLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => {
  return (
    <BaseLayout
      user={user}
      sideContent={<AdminSideDrawerContent user={user} />}
    >
      {children}
    </BaseLayout>
  );
};
