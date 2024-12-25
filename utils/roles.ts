import { UserRole } from '@/types/user';

// Centralized role priority system
const ROLE_PRIORITY: Record<UserRole, number> = {
  admin: 3,
  mod: 2,
  user: 1,
};

/**
 * Determines the user's role based on existing permissions and feeds.
 */
export const determineUserRole = (
  existingPermissions: { role: UserRole }[],
  createdFeeds: { did: string }[]
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
  createdFeeds: { did: string; uri: string }[],
  existingPermissions: { role: UserRole; feed_did: string; feed_name: string }[]
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

const buildAdminPermissions = (
  userDid: string,
  createdFeeds: { did: string; uri: string }[]
) => {
  return createdFeeds.map((feed) => {
    if (!feed.did || !feed.uri) {
      throw new Error(
        'Invalid feed data: Each feed must have a valid "did" and "uri".'
      );
    }
    return {
      user_did: userDid,
      feed_did: feed.did,
      feed_name: feed.uri.split('/').pop() || '',
      role: 'admin' as const,
      created_by: userDid,
      created_at: new Date().toISOString(),
    };
  });
};

const populatePermissionsMap = (
  permissionsMap: Map<
    string,
    {
      role: UserRole;
      feed_did: string;
      feed_name: string;
      user_did?: string;
      created_by?: string;
      created_at?: string;
    }
  >,
  permissions: { role: UserRole; feed_did: string; feed_name: string }[]
) => {
  permissions.forEach((perm) => {
    if (!perm.feed_did || !perm.feed_name || !perm.role) {
      throw new Error(
        'Invalid permission data: Each permission must have a valid feed_did, feed_name, and role.'
      );
    }
    if (!(perm.role in ROLE_PRIORITY)) {
      throw new Error(`Invalid role value: ${perm.role}`);
    }

    const existing = permissionsMap.get(perm.feed_did);

    // Apply only if it has higher priority or is not already present
    if (!existing || ROLE_PRIORITY[perm.role] > ROLE_PRIORITY[existing.role]) {
      permissionsMap.set(perm.feed_did, perm);
    }
  });
};
const overridePermissionsWithAdmin = (
  permissionsMap: Map<
    string,
    {
      role: UserRole;
      feed_did: string;
      feed_name: string;
      user_did?: string;
      created_by?: string;
      created_at?: string;
    }
  >,
  adminPermissions: {
    user_did: string;
    feed_did: string;
    feed_name: string;
    role: 'admin';
    created_by: string;
    created_at: string;
  }[]
) => {
  adminPermissions.forEach((adminPerm) => {
    const existing = permissionsMap.get(adminPerm.feed_did);

    // Admin always takes priority
    if (!existing || ROLE_PRIORITY['admin'] > ROLE_PRIORITY[existing.role]) {
      permissionsMap.set(adminPerm.feed_did, adminPerm);
    }
  });
};

export const buildFeedPermissions = (
  userDid: string,
  createdFeeds: { did: string; uri: string }[],
  existingPermissions: { role: UserRole; feed_did: string; feed_name: string }[]
) => {
  // Validate input data
  validateInputData(userDid, createdFeeds, existingPermissions);

  // Build admin permissions
  const adminPermissions = buildAdminPermissions(userDid, createdFeeds);

  // Create and populate the permissions map
  const permissionsMap = new Map<
    string,
    {
      role: UserRole;
      feed_did: string;
      feed_name: string;
      user_did?: string;
      created_by?: string;
      created_at?: string;
    }
  >();

  // Populate map with existing permissions and handle duplicates
  populatePermissionsMap(permissionsMap, existingPermissions);

  // Override with admin permissions
  overridePermissionsWithAdmin(permissionsMap, adminPermissions);

  // Return sorted permissions array
  return Array.from(permissionsMap.values()).sort((a, b) =>
    a.feed_did.localeCompare(b.feed_did)
  );
};
