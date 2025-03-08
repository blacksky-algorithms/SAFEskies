import { FeedRoleInfo, UserRole } from '@/lib/types/permission';

import { ModAction } from '@/lib/types/moderation';
import { ADMIN_ACTIONS } from '../constants/moderation';
import { User } from '../types/user';

export function canPerformWithRole(role: UserRole, action: ModAction): boolean {
  switch (action) {
    case 'mod_promote':
    case 'mod_demote':
    case 'user_unban':
    case 'user_ban':
      return role === 'admin';
    case 'post_delete':
      return role === 'mod' || role === 'admin';
    case 'post_restore':
      return role === 'mod' || role === 'admin';
    default:
      return false;
  }
}

export const groupModeratorsByFeed = (
  permissions: {
    uri: string;
    user_did: string;
    role: UserRole;
  }[]
) => {
  return permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.uri]) {
        acc[perm.uri] = [];
      }
      acc[perm.uri].push(perm);
      return acc;
    },
    {} as Record<
      string,
      {
        uri: string;
        user_did: string;
        role: UserRole;
      }[]
    >
  );
};

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

export function userCanViewAdminActions(user: User): boolean {
  return Object.values(user.rolesByFeed).some((roleInfo) =>
    ADMIN_ACTIONS.some((action) => canPerformWithRole(roleInfo.type, action))
  );
}
