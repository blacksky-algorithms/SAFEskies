import { User } from '@/types/user';
import { BaseLayout } from './base-layout';
import { ModSideDrawerContent } from '../mod-side-drawer-content';

export const ModLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) => {
  return (
    <BaseLayout user={user} sideContent={<ModSideDrawerContent user={user} />}>
      {children}
    </BaseLayout>
  );
};
