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

export function getLogsByFeedLinks(user: User | null) {
  if (!user) return [];
  return Object.values(user.rolesByFeed).reduce(
    (acc: { label: string; href: string }[], { displayName, uri, role }) => {
      if (canPerformWithRole(role, 'post_delete')) {
        acc.push({
          label: displayName,
          href: `/logs?uri=${encodeURIComponent(uri)}`,
        });
      }
      return acc;
    },
    []
  );
}
