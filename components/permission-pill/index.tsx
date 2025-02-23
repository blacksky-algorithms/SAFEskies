import { UserRole } from '@/lib/types/permission';

export const PermissionPill = ({ type }: { type: UserRole }) => {
  if (!type || type === 'user') return null;
  return (
    <span className='text-app bg-app-primary rounded-full px-2 py-1 text-xs'>
      {type}
    </span>
  );
};
