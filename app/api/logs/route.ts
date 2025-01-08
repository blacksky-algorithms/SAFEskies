import { NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';
import { ModAction } from '@/lib/types/moderation';
import { getAdminLogs, getFeedModerationLogs } from '@/repos/logs';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'admin' or 'feed'
    const feedUri = searchParams.get('feedUri');

    // Build filters from query parameters
    const filters = {
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

    // Get logs based on type
    const logs =
      type === 'admin'
        ? await getAdminLogs(filters)
        : await getFeedModerationLogs(feedUri!, filters);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
