'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getActorFeeds } from '@/repos/actor';
import { User } from '@/lib/types/user';
import { getProfile, saveProfile } from '@/repos/profile';

export const getBlueskyProfile = async (
  oAuthCallbackParams: URLSearchParams
) => {
  const { session } = await BlueskyOAuthClient.callback(oAuthCallbackParams);
  if (!session?.did) {
    throw new Error('Invalid session: No DID found.');
  }

  const atProtoAgentResponse = await AtprotoAgent.getProfile({
    actor: session.did,
  });

  if (!atProtoAgentResponse.success || !atProtoAgentResponse.data) {
    throw new Error('Failed to fetch atProtoAgentResponse.');
  }

  return atProtoAgentResponse.data;
};

export const handleOAuthCallback = async (request: NextRequest) => {
  try {
    // 1. Get initial profile data
    const profileData = await getBlueskyProfile(request.nextUrl.searchParams);

    // 2. Get user's feeds
    const feedsResponse = await getActorFeeds(profileData.did);
    const createdFeeds = feedsResponse?.feeds || [];

    // 3. Initialize session with basic profile data and empty rolesByFeed
    const ironSession = await getSession();
    const initialUser: User = {
      ...profileData,
      rolesByFeed: {},
    };
    ironSession.user = initialUser;
    await ironSession.save();

    // 4. Save profile and initialize feed permissions
    const success = await saveProfile(profileData, createdFeeds);
    if (!success) {
      throw new Error('Failed to save profile data');
    }

    // 5. Get complete profile with roles and update session
    const completeProfile = await getProfile();
    if (!completeProfile) {
      throw new Error('Failed to retrieve complete profile');
    }

    ironSession.user = completeProfile;
    await ironSession.save();

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/?redirected=true`,
      { status: 302 }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      )}`,
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  }
};
