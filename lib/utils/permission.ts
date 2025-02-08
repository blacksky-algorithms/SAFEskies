import { FeedPermission, FeedRoleInfo, UserRole } from '@/lib/types/permission';
import { ROLE_PRIORITY } from '@/lib/constants';
import { ModAction } from '@/lib/types/moderation';
import { ADMIN_ACTIONS } from '@/lib/constants/moderation';
import { User } from '@/lib/types/user';

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

export function buildFeedPermissions(
  userDid: string,
  createdFeeds: { uri: string; displayName?: string }[],
  existingPermissions: Omit<
    FeedPermission,
    'user_did' | 'created_by' | 'created_at'
  >[] = []
): FeedPermission[] {
  const permissionsMap = new Map<
    string,
    {
      role: UserRole;
      uri: string;
      feed_name: string;
      user_did: string;
      created_by?: string;
      created_at?: string;
    }
  >();

  createdFeeds.forEach((feed) => {
    if (!feed.uri) {
      throw new Error('Feed must have a valid "uri".');
    }
    permissionsMap.set(feed.uri, {
      user_did: userDid,
      uri: feed.uri,
      feed_name: feed.displayName || feed.uri.split('/').pop() || '',
      role: 'admin',
      created_by: userDid,
      created_at: new Date().toISOString(),
    });
  });

  existingPermissions.forEach((perm) => {
    if (!perm.uri || !perm.feed_name || !perm.role) {
      throw new Error(
        'Invalid permission data: Each permission must have a valid uri, feed_name, and role.'
      );
    }
    const existing = permissionsMap.get(perm.uri);
    if (!existing || ROLE_PRIORITY[perm.role] > ROLE_PRIORITY[existing.role]) {
      permissionsMap.set(perm.uri, { ...perm, user_did: userDid });
    }
  });

  return Array.from(permissionsMap.values());
}

export const determineUserRolesByFeed = (
  existingPermissions: {
    role: UserRole;
    uri: string;
    feed_name: string;
  }[],
  createdFeeds: { uri: string; displayName?: string }[]
): Record<string, FeedRoleInfo> => {
  const rolesByFeed: Record<string, FeedRoleInfo> = {};

  createdFeeds.forEach((feed) => {
    rolesByFeed[feed.uri] = {
      role: 'admin',
      displayName:
        feed.displayName || feed.uri.split('/').pop() || 'Unknown Feed',
      uri: feed.uri,
    };
  });

  existingPermissions.forEach((permission) => {
    const currentEntry = rolesByFeed[permission.uri] || {
      role: 'user',
      displayName: permission.feed_name || 'Unknown Feed',
      uri: permission.uri,
    };

    rolesByFeed[permission.uri] = {
      role:
        ROLE_PRIORITY[permission.role] > ROLE_PRIORITY[currentEntry.role]
          ? permission.role
          : currentEntry.role,
      displayName: currentEntry.displayName,
      uri: permission.uri,
    };
  });

  return rolesByFeed;
};

export function userCanViewAdminActions(user: User): boolean {
  return Object.values(user.rolesByFeed).some((roleInfo) =>
    ADMIN_ACTIONS.some((action) => canPerformWithRole(roleInfo.role, action))
  );
}

export async function reportToBlacksky(uris: { uri: string }[]) {
  console.log('reporting to blacksky', uris);
  return null;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RSKY_FEEDGEN}/queue/posts/delete`!,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-RSKY-KEY': process.env.RSKY_API_KEY!,
        },
        body: JSON.stringify(uris),
      }
    );
    console.log({ response });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
