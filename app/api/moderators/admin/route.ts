import { NextResponse } from 'next/server';
import { getAllModeratorsForAdmin } from '@/repos/permission';
import { getSession } from '@/repos/iron';

export async function GET() {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const moderators = await getAllModeratorsForAdmin(session.user.did);
    return NextResponse.json({ moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderators' },
      { status: 500 }
    );
  }
}
