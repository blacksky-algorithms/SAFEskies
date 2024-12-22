import { createUser } from '@/utils/createUser';
import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { saveUserProfile } from '@/repos/user';
import { NextRequest, NextResponse } from 'next/server';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getActorFeeds } from '@/repos/actor';
import { SupabaseInstance } from '@/repos/supabase';
import { determineUserRole, buildFeedPermissions } from '@/utils/roles';

export async function GET(request: NextRequest) {
  try {
    const blueskyClient = BlueskyOAuthClient;
    const { session } = await blueskyClient.callback(
      request.nextUrl.searchParams
    );

    const agentResponse = await AtprotoAgent.getProfile({
      actor: session.did,
    });

    if (!agentResponse.success || !agentResponse.data) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
          'Failed to fetch user profile.'
        )}`
      );
    }

    const agentProfile = agentResponse.data;
    const user = createUser(agentProfile);

    // Get existing permissions and created feeds in parallel
    const [permissionsResponse, feedsResponse] = await Promise.all([
      SupabaseInstance.from('feed_permissions')
        .select('*')
        .eq('user_did', user.did),
      getActorFeeds(user.did),
    ]);

    const existingPermissions = permissionsResponse.data || [];
    const createdFeeds = feedsResponse?.feeds || [];

    // Determine the user's role
    const userRole = determineUserRole(existingPermissions, createdFeeds);

    // Save feed permissions
    if (userRole === 'admin' || userRole === 'mod') {
      const feedPermissions = buildFeedPermissions(
        user.did,
        createdFeeds,
        existingPermissions
      );

      await SupabaseInstance.from('feed_permissions').upsert(feedPermissions, {
        onConflict: 'user_did,feed_did',
        ignoreDuplicates: false,
      });
    }

    // Save the user profile
    const saveSuccess = await saveUserProfile({
      ...user,
      role: userRole,
    });

    if (!saveSuccess) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
          'Failed to save user profile.'
        )}`
      );
    }

    // Update session
    const ironSession = await getSession();
    ironSession.user = { ...user, role: userRole };
    await ironSession.save();

    // Redirect based on role
    const redirectPath = userRole === 'user' ? '/' : `/${userRole}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_URL}${redirectPath}/?redirected=true`;

    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
        'An error occurred. Please try again.'
      )}`,
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  }
}
