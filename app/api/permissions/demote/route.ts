import { NextResponse } from 'next/server';
import { canPerformAction, setFeedRole } from '@/repos/permission';

export async function POST(request: Request) {
  try {
    console.log('Demote moderator API called');
    const { modDid, feedUri, setByUserDid, feedName } = await request.json();
    console.log(
      'Validating Fields -> ',
      modDid,
      feedUri,
      setByUserDid,
      feedName
    );

    // Validate required fields
    if (!modDid || !feedUri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    console.log('Fields Validated, checking permissions canPerformAction');

    // Check if the user has permission to demote moderators
    const hasPermission = await canPerformAction(
      setByUserDid,
      'remove_mod',
      feedUri
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to demote moderator' },
        { status: 403 }
      );
    }
    console.log('Permission checked, setting feed role');
    const success = await setFeedRole(
      modDid,
      feedUri,
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
    console.log('Moderator demoted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('Catch Error in demote moderator API:', error);
    console.error('Error in demote moderator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
