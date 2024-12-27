// app/api/mods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';
import { PermissionsManager } from '@/repos/permissions';
import { SupabaseInstance } from '@/repos/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.did) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userDid, feeds } = await request.json();
    console.log('Promote request data:', { userDid, feeds });

    if (!userDid || !Array.isArray(feeds) || feeds.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const permissionChecks = await Promise.all(
      feeds.map(async (feed) => {
        console.log('Checking permissions for feed:', feed);

        if (!session.user?.did) {
          console.error('Session user did is undefined');
          return false;
        }

        return PermissionsManager.canPerformAction(
          session.user.did,
          'create_mod',
          feed.uri
        );
      })
    );

    if (permissionChecks.some((result) => !result)) {
      console.error('Permission check failed for one or more feeds:', feeds);
      return NextResponse.json(
        { error: 'Insufficient permissions for one or more feeds' },
        { status: 403 }
      );
    }

    const results = await Promise.all(
      feeds.map(async (feed) => {
        console.log('Setting permissions for feed:', feed);

        if (!session.user?.did) {
          console.error('Session user did is undefined');
          return false;
        }

        return PermissionsManager.setFeedRole(
          userDid,
          feed.uri,
          'mod',
          session.user.did,
          feed.displayName
        );
      })
    );

    if (results.some((result) => !result)) {
      console.error('Failed to set permissions for one or more feeds:', feeds);
      return NextResponse.json(
        { error: 'Failed to set permissions for one or more feeds' },
        { status: 500 }
      );
    }

    console.log('Moderator promotion successful for:', { userDid, feeds });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error promoting moderator:', error);
    return NextResponse.json(
      { error: 'Failed to promote moderator' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.did) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userDid, feedUri } = await request.json();

    if (!userDid || !feedUri) {
      console.error('Invalid input:', { userDid, feedUri });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (!session.user?.did) {
      return NextResponse.json(
        { error: 'Session user did is undefined' },
        { status: 500 }
      );
    }

    const canRemoveMod = await PermissionsManager.canPerformAction(
      session.user.did,
      'remove_mod',
      feedUri
    );

    if (!canRemoveMod) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const currentRole = await PermissionsManager.getFeedRole(userDid, feedUri);

    await SupabaseInstance.from('feed_permissions')
      .delete()
      .eq('user_did', userDid)
      .eq('feed_uri', feedUri);

    await SupabaseInstance.from('revoked_roles').insert({
      user_did: userDid,
      feed_uri: feedUri,
      role: currentRole,
      revoked_by: session.user.did,
    });

    await SupabaseInstance.from('moderation_logs').insert({
      feed_uri: feedUri,
      performed_by: session.user.did,
      action: 'mod_demote',
      target_user_did: userDid,
      metadata: {
        previous_role: currentRole,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error demoting moderator:', error);
    return NextResponse.json(
      { error: 'Failed to demote moderator' },
      { status: 500 }
    );
  }
}
