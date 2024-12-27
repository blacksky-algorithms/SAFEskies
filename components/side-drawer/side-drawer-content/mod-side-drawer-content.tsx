import { User } from '@/types/user';
import { SideDrawerLink } from '../components/side-drawer-link';

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
          <SideDrawerLink
            label='Moderation Queue'
            href='/mod/reports'
            onClick={handleLinkClick}
          />
        </div>
      </div>
    </nav>
  );
};
