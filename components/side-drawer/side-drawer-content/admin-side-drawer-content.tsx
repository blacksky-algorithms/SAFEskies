import { User } from '@/types/user';

interface AdminSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const AdminSideDrawerContent = ({
  user,
  handleLinkClick,
}: AdminSideDrawerContentProps) => {
  if (!user) return null;

  return (
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>
          Admin Controls
        </h2>
        <div className='space-y-1'>
          <a
            onClick={() => handleLinkClick('/')}
            href='/'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Manage Feeds
          </a>
          <a
            onClick={() => handleLinkClick('/admin/moderators')}
            href='/admin/moderators'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Manage Moderators
          </a>
        </div>
      </div>

      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>Content</h2>
        <div className='space-y-1'>
          <a
            onClick={() => handleLinkClick('/admin/reports')}
            href='/admin/reports'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            View Reports
          </a>
          <a
            onClick={() => handleLinkClick('/admin/audit-log')}
            href='/admin/audit-log'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Audit Log
          </a>
        </div>
      </div>
    </nav>
  );
};
