import { NextResponse } from 'next/server';
import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';

export async function POST(request: Request) {
  try {
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    const url = await BlueskyOAuthClient.authorize(handle);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Error initiating Bluesky auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
