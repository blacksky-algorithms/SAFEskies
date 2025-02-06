import { User } from '@/lib/types/user';

export const getAdminUserFeeds = (profileRolesData?: User['rolesByFeed']) => {
  if (!profileRolesData) {
    return [];
  }
  return Object.values(profileRolesData).reduce(
    (acc, { role, feedUri: uri, displayName }) => {
      if (role === 'admin') {
        acc.push({ uri, displayName });
      }
      return acc;
    },
    [] as { uri: string; displayName?: string }[]
  );
};
