import { User } from '@/lib/types/user';
import { canPerformWithRole } from '@/lib/utils/permission';

export function getDateTimeRange(dateRange: {
  fromDate: string;
  toDate: string;
}) {
  const fromDateTime = `${dateRange.fromDate} 00:00:00.000+00`;
  const toDateTime = `${dateRange.toDate} 23:59:59.999+00`;
  return { fromDateTime, toDateTime };
}

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
