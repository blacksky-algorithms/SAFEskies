import { Log, LogFilters } from '@/lib/types/logs';
import { User } from '@/lib/types/user';
import { canPerformWithRole } from '@/lib/utils/permission';

// export async function fetchLogs(filters: LogFilters): Promise<Log[]> {
//   const params = new URLSearchParams();

//   Object.entries(filters).forEach(([key, value]) => {
//     if (!value) return;

//     if (key === 'dateRange') {
//       params.set('fromDate', value.fromDate);
//       params.set('toDate', value.toDate);
//     } else {
//       params.set(key, String(value));
//     }
//   });

//   const response = await fetch(`/api/logs?${params}`);
//   if (!response.ok) {
//     const data = await response.json();
//     throw new Error(data.error || 'Failed to fetch logs');
//   }

//   const data = await response.json();
//   return data.logs;
// }

export async function fetchLogs(filters: LogFilters): Promise<Log[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (key === 'dateRange' && value.fromDate && value.toDate) {
      params.set('fromDate', value.fromDate);
      params.set('toDate', value.toDate);
    } else {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/logs?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch logs');
  }

  const data = await response.json();
  return data.logs;
}

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
    (
      acc: { label: string; href: string }[],
      { displayName, feedUri, role }
    ) => {
      if (canPerformWithRole(role, 'post_delete')) {
        acc.push({
          label: displayName,
          href: `/logs?uri=${encodeURIComponent(feedUri)}`,
        });
      }
      return acc;
    },
    []
  );
}
