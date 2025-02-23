// app/api/permissions/promote/route.ts
import { NextResponse } from 'next/server';
import { canPerformAction, setFeedRole } from '@/repos/permission';
import { SupabaseInstance } from '@/repos/supabase';

export async function POST(request: Request) {
  try {
    // Get data from request body
    const { targetUserDid, uri, setByUserDid, feedName } = await request.json();

    // Validate required fields
    if (!targetUserDid || !uri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user has permission to promote moderators
    const hasPermission = await canPerformAction(
      setByUserDid,
      'mod_promote',
      uri
    );
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions to promote moderator' },
        { status: 403 }
      );
    }

    // Check if the target user has a profile in the "profiles" table.
    // Use .maybeSingle() so that no error is thrown if no row is found.
    const { data: profile, error: profileError } = await SupabaseInstance.from(
      'profiles'
    )
      .select('*')
      .eq('did', targetUserDid)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Error fetching target profile' },
        { status: 500 }
      );
    }
    console.log({ profile, profileError });
    // If no profile exists, create a minimal one.
    if (!profile) {
      const minimalProfile = {
        did: targetUserDid,
        handle: targetUserDid, // you could set a default handle or a placeholder
        // Add any other required fields with default values here
      };

      const { error: insertError } = await SupabaseInstance.from(
        'profiles'
      ).insert([minimalProfile]);

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json(
          { error: 'Error creating profile for target user' },
          { status: 500 }
        );
      }
    }

    // Attempt to set the feed role (promote the user)
    const success = await setFeedRole(
      targetUserDid,
      uri,
      'mod',
      setByUserDid,
      feedName
    );
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to promote moderator' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in promote moderator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
