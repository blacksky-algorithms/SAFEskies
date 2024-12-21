import { User } from '@/types/user';

interface ModSideDrawerContentProps {
  user: User | null;
  handleLinkClick: (path: string) => void;
}

export const ModSideDrawerContent = ({
  user,
  handleLinkClick,
}: ModSideDrawerContentProps) => {
  if (!user) return null;

  return (
    <nav className='p-4 space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-app-secondary font-semibold px-4'>Moderation</h2>
        <div className='space-y-1'>
          <a
            onClick={() => handleLinkClick('/')}
            href='/mod/reports'
            className='block px-4 py-2 text-app hover:bg-app-secondary-hover rounded-lg'
          >
            Moderation Queue
          </a>
        </div>
      </div>
    </nav>
  );
};
