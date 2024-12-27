import { FeedRoleInfo, UserRole } from '@/types/user';

// Centralized role priority system
const ROLE_PRIORITY: Record<UserRole, number> = {
  admin: 3,
  mod: 2,
  user: 1,
};

export const determineUserRole = (
  existingPermissions: { role: UserRole }[],
  createdFeeds: { uri: string }[]
): UserRole => {
  if (createdFeeds.length > 0) {
    return 'admin';
  }
  if (existingPermissions.some((p) => p.role === 'mod')) {
    return 'mod';
  }
  return 'user';
};

const validateInputData = (
  userDid: string,
  createdFeeds: { uri: string }[],
  existingPermissions: { role: UserRole; feed_uri: string; feed_name: string }[]
) => {
  if (!userDid || typeof userDid !== 'string') {
    throw new Error('Invalid user ID provided.');
  }
  if (!Array.isArray(createdFeeds) || !Array.isArray(existingPermissions)) {
    throw new Error(
      'Invalid input data: createdFeeds and existingPermissions must be arrays.'
    );
  }
};

export const buildFeedPermissions = (
  userDid: string,
  createdFeeds: { uri: string; displayName?: string }[],
  existingPermissions: { role: UserRole; feed_uri: string; feed_name: string }[]
) => {
  const permissionsMap = new Map<
    string,
    {
      role: UserRole;
      feed_uri: string;
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
      feed_uri: feed.uri,
      feed_name: feed.displayName || feed.uri.split('/').pop() || '',
      role: 'admin',
      created_by: userDid,
      created_at: new Date().toISOString(),
    });
  });

  existingPermissions.forEach((perm) => {
    if (!perm.feed_uri || !perm.feed_name || !perm.role) {
      throw new Error(
        'Invalid permission data: Each permission must have a valid feed_uri, feed_name, and role.'
      );
    }
    const existing = permissionsMap.get(perm.feed_uri);
    if (!existing || ROLE_PRIORITY[perm.role] > ROLE_PRIORITY[existing.role]) {
      permissionsMap.set(perm.feed_uri, { ...perm, user_did: userDid }); // Ensure user_did
    }
  });

  return Array.from(permissionsMap.values());
};

export const determineUserRolesByFeed = (
  existingPermissions: {
    role: UserRole;
    feed_uri: string;
    feed_name: string;
  }[],
  createdFeeds: { uri: string; displayName?: string }[]
): Record<string, FeedRoleInfo> => {
  const rolesByFeed: Record<string, FeedRoleInfo> = {};

  // Assign admin role to feeds the user created
  createdFeeds.forEach((feed) => {
    rolesByFeed[feed.uri] = {
      role: 'admin',
      displayName:
        feed.displayName || feed.uri.split('/').pop() || 'Unknown Feed',
      feedUri: feed.uri,
    };
  });

  // Update roles based on permissions
  existingPermissions.forEach((permission) => {
    const currentEntry = rolesByFeed[permission.feed_uri] || {
      role: 'user',
      displayName: permission.feed_name || 'Unknown Feed',
      feedUri: permission.feed_uri,
    };

    rolesByFeed[permission.feed_uri] = {
      role:
        ROLE_PRIORITY[permission.role] > ROLE_PRIORITY[currentEntry.role]
          ? permission.role
          : currentEntry.role,
      displayName: currentEntry.displayName, // Preserve displayName
      feedUri: permission.feed_uri,
    };
  });

  return rolesByFeed;
};

// export const determineUserRolesByFeed = (
//   existingPermissions: {
//     role: UserRole;
//     feed_uri: string;
//     feed_name: string;
//   }[],
//   createdFeeds: { uri: string }[]
// ) => {
//   const rolesByFeed: Record<string, UserRole> = {};

//   // Assign admin role to feeds the user created
//   createdFeeds.forEach((feed) => {
//     rolesByFeed[feed.uri] = 'admin';
//   });

//   // Update roles based on permissions
//   existingPermissions.forEach((permission) => {
//     const currentRole = rolesByFeed[permission.feed_uri] || 'user';
//     rolesByFeed[permission.feed_uri] =
//       ROLE_PRIORITY[permission.role] > ROLE_PRIORITY[currentRole]
//         ? permission.role
//         : currentRole;
//   });

//   return rolesByFeed;
// };
