// app/api/permissions/promote/route.ts
import { NextResponse } from 'next/server';
import { canPerformAction, setFeedRole } from '@/repos/permission';

export async function POST(request: Request) {
  try {
    // Get data from request body
    const { targetUserDid, feedUri, setByUserDid, feedName } =
      await request.json();

    // Validate required fields
    if (!targetUserDid || !feedUri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user has permission to promote moderators
    const hasPermission = await canPerformAction(
      setByUserDid,
      'create_mod',
      feedUri
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to promote moderator' },
        { status: 403 }
      );
    }

    // Attempt to set the role
    const success = await setFeedRole(
      targetUserDid,
      feedUri,
      'mod',
      setByUserDid,
      feedName
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to promote moderator' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in promote moderator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
