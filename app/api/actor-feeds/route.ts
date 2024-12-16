import { NextRequest, NextResponse } from 'next/server';
import { getActorFeeds } from '@/repos/actor';

export async function GET(request: NextRequest) {
  try {
    const actorUri = request.nextUrl.searchParams.get('actor');
    if (!actorUri) {
      return NextResponse.json(
        { error: 'Actor URI is required.' },
        { status: 400 }
      );
    }

    const data = await getActorFeeds(actorUri);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in feed generator API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed generator data.' },
      { status: 500 }
    );
  }
}
