import { FeedRoleInfo, UserRole } from '@/lib/types/permission';

import { ModAction } from '@/lib/types/moderation';

export function canPerformWithRole(role: UserRole, action: ModAction): boolean {
  switch (action) {
    case 'mod_promote':
    case 'mod_demote':
      return role === 'admin';
    case 'user_unban':
    case 'user_ban':
      return role === 'mod' || role === 'admin';
    case 'post_delete':
      return role === 'mod' || role === 'admin';
    case 'post_restore':
      return role === 'mod' || role === 'admin';
    default:
      return false;
  }
}

export const getHighestRoleForUser = (
  userRolesByFeed: FeedRoleInfo[] | undefined
) => {
  if (!userRolesByFeed) {
    return 'user';
  }
  if (userRolesByFeed.some((element) => element.type === 'admin'))
    return 'admin';
  if (userRolesByFeed.some((element) => element.type === 'mod')) return 'mod';
  return 'user';
};
