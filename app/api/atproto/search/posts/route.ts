import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all query parameters
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const author = searchParams.get('author');
    const mentions = searchParams.get('mentions');
    const hashtags = searchParams.get('hashtags');
    const limit = searchParams.get('limit') || '25';
    const includeModerationContext = searchParams.get('includeModerationContext');

    if (!q) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Build query string for the backend
    const params = new URLSearchParams();
    params.set('q', q);
    if (sort) params.set('sort', sort);
    if (since) params.set('since', since);
    if (until) params.set('until', until);
    if (author) params.set('author', author);
    if (mentions) params.set('mentions', mentions);
    if (hashtags) params.set('hashtags', hashtags);
    if (includeModerationContext) params.set('includeModerationContext', includeModerationContext);
    params.set('limit', limit);

    const response = await fetchWithAuth(`/api/atproto/search/posts?${params.toString()}`, {
      method: 'GET',
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : {};
      return NextResponse.json(
        { error: errorData.error || 'Failed to search posts' },
        { status: response ? response.status : 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
