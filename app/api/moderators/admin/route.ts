import { NextResponse } from 'next/server';
import { getAllModeratorsForAdmin } from '@/repos/permission';

import { getProfile } from '@/repos/profile';

export async function GET() {
  try {
    const user = await getProfile();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const moderators = await getAllModeratorsForAdmin(user.did);
    return NextResponse.json({ moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderators' },
      { status: 500 }
    );
  }
}
