// app/components/mod-side-drawer-content.tsx
import { User } from '@/types/user';
import Link from 'next/link';

interface ModSideDrawerContentProps {
  user: User | null;
}

export const ModSideDrawerContent = ({ user }: ModSideDrawerContentProps) => {
  if (!user) return null;

  return (
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>Moderation</h2>
        <div className='space-y-1'>
          <Link
            href='/mod/queue'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Moderation Queue
          </Link>
          <Link
            href='/mod/reports'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            User Reports
          </Link>
          <Link
            href='/mod/banned'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Banned Users
          </Link>
        </div>
      </div>

      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>
          Feed Management
        </h2>
        <div className='space-y-1'>
          <Link
            href='/mod/posts'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Review Posts
          </Link>
          <Link
            href='/mod/history'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Mod History
          </Link>
        </div>
      </div>
    </nav>
  );
};
