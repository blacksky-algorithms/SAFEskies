import { User } from '@/lib/types/user';
import { canPerformWithRole } from '@/lib/utils/permission';
import { UserRole } from '../types/permission';

export function getLinksByFeed(user: User | null, linkType: 'logs' | 'feed') {
  if (!user) return [];
  return user.rolesByFeed.reduce(
    (
      acc: { label: string; href: string; permission: UserRole }[],
      { displayName, uri, type }
    ) => {
      if (canPerformWithRole(type, 'post_delete')) {
        acc.push({
          label: displayName,
          href:
            linkType === 'logs'
              ? `/${linkType}?uri=${encodeURIComponent(uri)}`
              : `/?uri=${encodeURIComponent(uri)}&feed=${displayName}`,
          permission: type,
        });
      }
      return acc;
    },
    []
  );
}

export function hasBlackskyPermission(user: User | null): boolean {
  if (!user) return false;
  const blackskyRole = user.rolesByFeed.find(role =>
    role.displayName.toLowerCase().includes('blacksky')
  );
  return blackskyRole ? canPerformWithRole(blackskyRole.type, 'user_ban') : false;
}
