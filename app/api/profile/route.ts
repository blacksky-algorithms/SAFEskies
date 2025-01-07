import { getProfile } from '@/repos/profile';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getProfile();

    if (!profile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
