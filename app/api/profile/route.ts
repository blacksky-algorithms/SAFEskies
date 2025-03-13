import { getProfile } from '@/repos/profile';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getProfile();

    if (!profile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}
