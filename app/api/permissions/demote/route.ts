import { NextResponse } from 'next/server';
import { canPerformAction, setFeedRole } from '@/repos/permission';

export async function POST(request: Request) {
  try {
    const { modDid, uri, setByUserDid, feedName } = await request.json();

    // Validate required fields
    if (!modDid || !uri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user has permission to demote moderators
    const hasPermission = await canPerformAction(
      setByUserDid,
      'mod_demote',
      uri
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to demote moderator' },
        { status: 403 }
      );
    }

    const success = await setFeedRole(
      modDid,
      uri,
      'user',
      setByUserDid,
      feedName
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to demote moderator' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error demoting moderator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
