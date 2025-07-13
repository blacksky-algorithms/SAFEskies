import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const uris = searchParams.get('uris');

    if (!uris) {
      return NextResponse.json(
        { error: 'URIs parameter is required' },
        { status: 400 }
      );
    }

    // Validate max 25 URIs
    const uriList = uris.split(',');
    if (uriList.length > 25) {
      return NextResponse.json(
        { error: 'Maximum 25 URIs allowed' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.set('uris', uris);

    const response = await fetchWithAuth(`/api/atproto/posts?${params.toString()}`, {
      method: 'GET',
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : {};
      return NextResponse.json(
        { error: errorData.error || 'Failed to get posts' },
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
