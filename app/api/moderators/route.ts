// app/api/moderators/route.ts
import { NextResponse } from 'next/server';
import { getAllModeratorsForAdmin } from '@/repos/permission';
import { getSession } from '@/repos/iron';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userDid = session.user.did;

    try {
      const moderators = await getAllModeratorsForAdmin(userDid);
      return NextResponse.json({ moderators });
    } catch (error) {
      console.error('Error fetching moderators:', error);

      return NextResponse.json(
        { error: 'Failed to fetch moderators' },
        { status: 500 }
      );
    }
  } catch (sessionError) {
    console.error('Session error:', sessionError);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 401 }
    );
  }
}
