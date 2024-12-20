// app/components/admin-side-drawer-content.tsx
import { User } from '@/types/user';
import Link from 'next/link';

interface AdminSideDrawerContentProps {
  user: User | null;
}

export const AdminSideDrawerContent = ({
  user,
}: AdminSideDrawerContentProps) => {
  if (!user) return null;

  return (
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>
          Admin Controls
        </h2>
        <div className='space-y-1'>
          <Link
            href='/admin/feeds'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Manage Feeds
          </Link>
          <Link
            href='/admin/users'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Manage Users
          </Link>
          <Link
            href='/admin/moderators'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Manage Moderators
          </Link>
        </div>
      </div>

      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>Content</h2>
        <div className='space-y-1'>
          <Link
            href='/admin/reports'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            View Reports
          </Link>
          <Link
            href='/admin/audit-log'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Audit Log
          </Link>
        </div>
      </div>
    </nav>
  );
};
