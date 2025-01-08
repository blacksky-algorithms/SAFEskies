import { NextResponse } from 'next/server';
import { AtprotoAgent } from '@/repos/atproto-agent';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('searchQuery');

  if (!searchQuery) {
    return NextResponse.json(
      { error: 'Feed URI is required' },
      { status: 400 }
    );
  }

  try {
    const response = await AtprotoAgent.app.bsky.actor.searchActors({
      term: searchQuery,
      limit: 5,
    });

    if ('error' in response) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({
      results: response,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
