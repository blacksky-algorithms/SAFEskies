/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { NextRequest, NextResponse } from 'next/server';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getActorFeeds } from '@/repos/actor';
import { SupabaseInstance } from '@/repos/supabase';
import { buildFeedPermissions, determineUserRolesByFeed } from '@/utils/roles';
import { saveUserProfile } from '@/repos/user';

// Chunk array into smaller parts
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export async function GET(request: NextRequest) {
  try {
    const { session } = await BlueskyOAuthClient.callback(
      request.nextUrl.searchParams
    );

    if (!session?.did) {
      throw new Error('Invalid session: No DID found.');
    }

    const atProtoAgentResponse = await AtprotoAgent.getProfile({
      actor: session.did,
    });

    if (!atProtoAgentResponse.success || !atProtoAgentResponse.data) {
      throw new Error('Failed to fetch atProtoAgentResponse.');
    }

    const { data: agentProfileData } = atProtoAgentResponse;

    // Ensure the profile exists in the database
    const { error: profileError } = await SupabaseInstance.from('profiles')
      .upsert({
        did: agentProfileData.did,
        handle: agentProfileData.handle,
        name: agentProfileData.name,
        avatar: agentProfileData.avatar,
        associated: agentProfileData.associated,
        labels: agentProfileData.labels,
      })
      .eq('did', agentProfileData.did);

    if (profileError) {
      console.error('Error saving agentProfileData:', profileError);
      throw new Error('Failed to save agentProfileData.');
    }

    const [permissionsResponse, feedsResponse] = await Promise.all([
      SupabaseInstance.from('feed_permissions')
        .select('*')
        .eq('user_did', agentProfileData.did),
      getActorFeeds(agentProfileData.did),
    ]);

    const existingPermissions = permissionsResponse.data || [];
    const createdFeeds = feedsResponse?.feeds || [];

    // Log permissions for debugging
    console.log('Existing Permissions:', existingPermissions);
    console.log('Created Feeds:', createdFeeds);

    // Validate `existingPermissions` structure
    const validPermissions = existingPermissions
      .map((perm) => {
        if (!perm.feed_uri || !perm.feed_name || !perm.role) {
          console.warn('Invalid permission:', perm);
          return null;
        }
        return {
          ...perm,
          user_did: perm.user_did || agentProfileData.did, // Provide a fallback
        };
      })
      .filter((perm): perm is NonNullable<typeof perm> => perm !== null);

    // Determine user roles by feed
    const rolesByFeed = determineUserRolesByFeed(
      validPermissions,
      createdFeeds
    );

    // Build feed permissions
    const feedPermissions = buildFeedPermissions(
      agentProfileData.did,
      createdFeeds,
      validPermissions
    );

    // Chunk permissions to prevent conflicts during upsert
    const permissionChunks = chunkArray(feedPermissions, 50);

    for (const chunk of permissionChunks) {
      const { error: upsertError } = await SupabaseInstance.from(
        'feed_permissions'
      ).upsert(chunk, {
        onConflict: 'user_did,feed_uri',
      });

      if (upsertError) {
        console.error(
          'Error saving feed permissions (chunk):',
          upsertError,
          chunk
        );
        throw new Error('Failed to save feed permissions.');
      }
    }

    const saveSuccess = await saveUserProfile(
      { ...agentProfileData, rolesByFeed },
      createdFeeds
    );

    if (!saveSuccess) {
      throw new Error('Failed to save agentProfileData.');
    }

    const ironSession = await getSession();
    ironSession.user = { ...agentProfileData, rolesByFeed };
    await ironSession.save();

    const redirectPath = '/';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}${redirectPath}/?redirected=true`,
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
}
