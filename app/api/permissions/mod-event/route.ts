import { NextResponse } from 'next/server';
import { canPerformAction } from '@/repos/permission';
import { createModerationLog } from '@/repos/logs';
import { getProfile } from '@/repos/profile';
import { ModAction } from '@/lib/types/moderation';
import { reportToBlacksky } from '@/lib/utils/permission';

export async function POST(request: Request) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
    const userDID = profile.did;
    // Parse the request body
    const {
      targetedPostUri,
      reason,
      toServices,
      targetedUserDid,
      feedUri,
      feedName,
      additionalInfo,
    } = await request.json();

    // Validate the required fields
    if (
      !targetedPostUri ||
      !reason ||
      !toServices ||
      !targetedUserDid ||
      !feedUri
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user has permission to perform the moderation action
    const hasPermission = await canPerformAction(
      userDID,
      'post_delete',
      feedUri
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to perform this moderation action' },
        { status: 403 }
      );
    }
    const entryData = {
      target_post_uri: targetedPostUri,
      reason,
      to_services: toServices.map(
        (item: { label: string; value: string }) => item.value
      ),
      feed_uri: feedUri,
      action: 'post_delete' as ModAction,
    };
    // Create the moderation log entry
    const logEntry = {
      ...entryData,
      target_user_did: targetedUserDid,
      performed_by: userDID,
      additional_info: additionalInfo,
      metadata: {
        ...entryData,
        feed_name: feedName,
        additional_info: additionalInfo,
      },
    };

    await createModerationLog(logEntry);

    // if reporting to the mod service with the value of 'blacksky' then do fetch action
    if (
      toServices.some(
        (service: { label: string; value: string }) =>
          service.value === 'blacksky'
      )
    ) {
      await reportToBlacksky(targetedPostUri);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in moderation event API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
