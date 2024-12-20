import { createUser } from '@/utils/createUser';
import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { saveUserProfile } from '@/repos/user';
import { NextRequest, NextResponse } from 'next/server';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';

export async function GET(request: NextRequest) {
  try {
    const blueskyClient = BlueskyOAuthClient;

    // Get OAuth session from callback
    const { session } = await blueskyClient.callback(
      request.nextUrl.searchParams
    );

    // Validate tokens (auto-refresh if needed)
    const tokenInfo = await session.getTokenInfo('auto');
    if (tokenInfo.expired) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
          'Session is expired. Please log in again.'
        )}`
      );
    }

    // Fetch user profile using the DID
    const agentResponse = await AtprotoAgent.getProfile({
      actor: session.did, // Use the DID from the session
    });

    if (!agentResponse.success || !agentResponse.data) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
          'Failed to fetch user profile.'
        )}`
      );
    }

    const agentProfile = agentResponse.data;

    // Normalize and save user profile
    const user = createUser(agentProfile);
    const saveSuccess = await saveUserProfile(user);

    if (!saveSuccess) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
          'Failed to save user profile.'
        )}`
      );
    }

    // Persist session in IronSession
    const ironSession = await getSession();
    ironSession.user = user;
    await ironSession.save();

    // Clean up URL and redirect to the base `/mod` path with NEXT_PUBLIC_URL
    const cleanUrl = new URL(`${process.env.NEXT_PUBLIC_URL}/mod`);

    cleanUrl.searchParams.delete('iss');
    cleanUrl.searchParams.delete('state');
    cleanUrl.searchParams.delete('code');

    return NextResponse.redirect(cleanUrl.toString(), { status: 302 });
  } catch (error: unknown) {
    console.error('OAuth callback error:', error);

    // Redirect to login with an error message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
        'An error occurred. Please try again.'
      )}`
    );
  }
}
