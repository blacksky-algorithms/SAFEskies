import { NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';
import { getLogs } from '@/repos/logs';
import { LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { User } from '@/lib/types/user';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const user = session.user as User;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedUri = searchParams.get('feedUri') || undefined;

    const filters: LogFilters = {
      feedUri,
      action: searchParams.get('action') as ModAction | null,
      performedBy: searchParams.get('performedBy') || undefined,
      targetUser: searchParams.get('targetUser') || undefined,
      targetPost: searchParams.get('targetPost') || undefined,
      sortBy: (searchParams.get('sortBy') || 'descending') as
        | 'ascending'
        | 'descending',
      dateRange:
        searchParams.has('fromDate') && searchParams.has('toDate')
          ? {
              fromDate: searchParams.get('fromDate')!,
              toDate: searchParams.get('toDate')!,
            }
          : undefined,
    };

    // Check if the user has admin access to the feed URI
    const shouldExcludeAdminActions =
      feedUri && !userHasAdminAccess(user, feedUri);

    // Fetch logs
    let logs = await getLogs(filters);

    // Filter out 'mod_promote' and 'mod_demote' if necessary
    if (shouldExcludeAdminActions) {
      logs = logs.filter(
        (log) => log.action !== 'mod_promote' && log.action !== 'mod_demote'
      );
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

/**
 * Determines if the user has the 'admin' role for the given feed URI.
 */
function userHasAdminAccess(user: User, feedUri: string): boolean {
  const feedRoleInfo = user.rolesByFeed[feedUri];
  return feedRoleInfo?.role === 'admin';
}
