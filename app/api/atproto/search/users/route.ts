import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') || '25';
    const cursor = searchParams.get('cursor');

    if (!q) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Build query string for the backend
    const params = new URLSearchParams();
    params.set('q', q);
    params.set('limit', limit);
    if (cursor) params.set('cursor', cursor);

    const response = await fetchWithAuth(`/api/atproto/search/users?${params.toString()}`, {
      method: 'GET',
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : {};
      return NextResponse.json(
        { error: errorData.error || 'Failed to search users' },
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
