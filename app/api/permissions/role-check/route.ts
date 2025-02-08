// app/api/permissions/check-existing-role/route.ts
import { NextResponse } from 'next/server';
import { getFeedRole } from '@/repos/permission';
import { UserRole } from '@/lib/types/permission';

export async function GET(request: Request) {
  // Get the URL parameters
  const { searchParams } = new URL(request.url);
  const userDid = searchParams.get('userDid');
  const uri = searchParams.get('uri');

  // Validate required parameters
  if (!userDid || !uri) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Get the user's role for this feed
    const role: UserRole = await getFeedRole(userDid, uri);

    return NextResponse.json({ role });
  } catch (error) {
    // Log the error server-side for debugging
    console.error('Error checking feed role:', error);

    // Return a user-friendly error response
    return NextResponse.json(
      { error: 'Failed to check user role' },
      { status: 500 }
    );
  }
}
