import { NextRequest, NextResponse } from 'next/server';
import { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import { getSession } from '@/repos/iron';
import { AtprotoAgent } from '@/repos/atproto-agent';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getActorFeeds } from '@/repos/actor';
import { SupabaseInstance } from '@/repos/supabase';
import { buildFeedPermissions, determineUserRolesByFeed } from '@/utils/roles';
import { saveUserProfile } from '@/repos/profile';
import { FeedRoleInfo, User, UserRole } from '@/types/user';

class AuthenticationHandler {
  private static async getBlueskyProfile(
    oAuthCallbackParams: URLSearchParams
  ): Promise<ProfileViewBasic> {
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
  }

  private static async getFeedData(userDid: string) {
    const [permissionsResponse, feedsResponse] = await Promise.all([
      SupabaseInstance.from('feed_permissions')
        .select('*')
        .eq('user_did', userDid),
      getActorFeeds(userDid),
    ]);

    const existingPermissions = permissionsResponse.data || [];
    const createdFeeds = feedsResponse?.feeds || [];

    const validPermissions = existingPermissions
      .map((perm) => {
        if (!perm.feed_uri || !perm.feed_name || !perm.role) {
          console.warn('Invalid permission:', perm);
          return null;
        }
        return {
          ...perm,
          user_did: perm.user_did || userDid,
        };
      })
      .filter((perm): perm is NonNullable<typeof perm> => perm !== null);

    return { validPermissions, createdFeeds };
  }

  private static async saveFeedPermissions(
    userDid: string,
    validPermissions: Array<{
      role: UserRole;
      feed_uri: string;
      feed_name: string;
    }>,
    createdFeeds: Array<{ uri: string; displayName?: string }>
  ) {
    const feedPermissions = buildFeedPermissions(
      userDid,
      createdFeeds,
      validPermissions
    );

    for (const permission of feedPermissions) {
      const { error: upsertError } = await SupabaseInstance.from(
        'feed_permissions'
      ).upsert(permission, {
        onConflict: 'user_did,feed_uri',
      });

      if (upsertError) {
        console.error(
          'Error saving feed permissions:',
          upsertError,
          permission
        );
        throw new Error('Failed to save feed permissions.');
      }
    }

    return feedPermissions;
  }

  private static async saveUserData(
    profileData: ProfileViewBasic,
    rolesByFeed: Record<string, FeedRoleInfo>,
    createdFeeds: Array<{ uri: string; displayName?: string }>
  ) {
    const userData: User = { ...profileData, rolesByFeed };
    const saveSuccess = await saveUserProfile(userData, createdFeeds);

    if (!saveSuccess) {
      throw new Error('Failed to save user profile data.');
    }

    const ironSession = await getSession();
    ironSession.user = userData;
    await ironSession.save();
  }

  static async handleOAuthCallback(request: NextRequest) {
    try {
      // 1. Get Bluesky profile data
      const profileData = await this.getBlueskyProfile(
        request.nextUrl.searchParams
      );

      // 2. Get and validate feed data
      const { validPermissions, createdFeeds } = await this.getFeedData(
        profileData.did
      );

      // 3. Determine roles and save permissions
      const rolesByFeed = determineUserRolesByFeed(
        validPermissions,
        createdFeeds
      );
      await this.saveFeedPermissions(
        profileData.did,
        validPermissions,
        createdFeeds
      );

      // 4. Save user profile and session
      await this.saveUserData(profileData, rolesByFeed, createdFeeds);

      // 5. Redirect to home page
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
  }
}

export async function GET(request: NextRequest) {
  return AuthenticationHandler.handleOAuthCallback(request);
}
