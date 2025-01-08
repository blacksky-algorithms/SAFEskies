import { NextResponse } from 'next/server';
import { fetchFeed } from '@/repos/feeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');
  const cursor = searchParams.get('cursor') || undefined;
  const limit = Number(searchParams.get('limit')) || 50;

  if (!uri) {
    return NextResponse.json(
      { error: 'Feed URI is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetchFeed({
      uri,
      cursor,
      limit,
    });

    if ('error' in response) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({
      feed: response.feed,
      cursor: response.cursor,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
