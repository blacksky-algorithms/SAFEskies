import { NextResponse } from 'next/server';
import { getLogs } from '@/repos/logs';
import { LogFilters } from '@/lib/types/logs';
import { ModAction } from '@/lib/types/moderation';
import { ADMIN_ACTIONS } from '@/lib/constants/moderation';
import { getProfile } from '@/repos/profile';
import { userCanViewAdminActions } from '@/lib/utils/permission';

export async function GET(request: Request) {
  try {
    const user = await getProfile();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: LogFilters = {
      uri: searchParams.get('uri') || undefined,
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

    // Determine if the user can view admin-level actions
    const canViewAdminActions = userCanViewAdminActions(user);

    // Fetch logs
    let logs = await getLogs(filters);

    // Filter out admin actions if the user lacks permission
    if (!canViewAdminActions) {
      logs = logs.filter((log) => !ADMIN_ACTIONS.includes(log.action));
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
