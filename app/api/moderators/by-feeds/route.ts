import { NextResponse } from 'next/server';
import { getModeratorsByFeeds } from '@/repos/permission';
import { Feed } from '@atproto/api/dist/client/types/app/bsky/feed/describeFeedGenerator';

export async function POST(request: Request) {
  try {
    const { feeds } = (await request.json()) as { feeds: Feed[] };

    if (!Array.isArray(feeds)) {
      return NextResponse.json(
        { error: 'Invalid feeds data' },
        { status: 400 }
      );
    }

    const moderatorsByFeed = await getModeratorsByFeeds(feeds);
    return NextResponse.json({ moderatorsByFeed });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderators' },
      { status: 500 }
    );
  }
}
