import { createUser } from '@/utils/createUser';
import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { saveUserProfile } from '@/repos/user';
import { NextRequest, NextResponse } from 'next/server';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getActorFeeds } from '@/repos/actor';
import { SupabaseInstance } from '@/repos/supabase';
import { UserRole } from '@/types/user';

// app/oauth/callback/route.ts
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

    // Check for created feeds
    const feedsResponse = await getActorFeeds(user.did);
    const hasCreatedFeeds =
      feedsResponse?.feeds && feedsResponse.feeds.length > 0;

    // A user starts as a regular user unless they have created feeds
    let userRole: UserRole = 'user';

    // Only upgrade to admin if they've created feeds
    if (hasCreatedFeeds) {
      userRole = 'admin';

      // Set up feed permissions for their created feeds
      const feedPermissions = feedsResponse.feeds.map((feed) => ({
        user_did: user.did,
        feed_did: feed.did,
        feed_name: feed.uri.split('/').pop() || '',
        role: 'admin',
        created_by: user.did,
        created_at: new Date().toISOString(),
      }));

      // Save feed permissions
      await SupabaseInstance.from('feed_permissions').upsert(feedPermissions, {
        onConflict: 'user_did,feed_did,feed_name',
      });
    }

    // Save or update the user's global role
    await SupabaseInstance.from('user_roles').upsert({
      user_did: user.did,
      role: userRole,
      created_by: user.did,
      created_at: new Date().toISOString(),
    });

    // Save the basic profile
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

    // Update session with the correct role
    const ironSession = await getSession();
    ironSession.user = {
      ...user,
      role: userRole,
    };
    await ironSession.save();

    const redirectPath = userRole === 'user' ? '/' : `/${userRole}`;
    // Netlify won't strip the params from oauth URLs,but does respect replacing them
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
