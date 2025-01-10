import { NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';
import { getLogs } from '@/repos/logs';
import { LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const filters: LogFilters = {
      feedUri: searchParams.get('feedUri') || undefined,
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

    const logs = await getLogs(filters);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
