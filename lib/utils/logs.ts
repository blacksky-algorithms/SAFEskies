import { User } from '@/lib/types/user';
import { canPerformWithRole } from '@/lib/utils/permission';

export function getLinksByFeed(user: User | null, linkType: 'logs' | 'feed') {
  if (!user) return [];
  return user.rolesByFeed.reduce(
    (acc: { label: string; href: string }[], { displayName, uri, type }) => {
      if (canPerformWithRole(type, 'post_delete')) {
        acc.push({
          label: displayName,
          href:
            linkType === 'logs'
              ? `/${linkType}?uri=${encodeURIComponent(uri)}`
              : `/?uri=${encodeURIComponent(uri)}`,
        });
      }
      return acc;
    },
    []
  );
}
