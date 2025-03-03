import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUserDid, uri, setByUserDid, feedName } = body;

    // Validate required fields.
    if (!targetUserDid || !uri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward the request to your Node API promote endpoint.
    const response = await fetchWithAuth('/api/permissions/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserDid, uri, setByUserDid, feedName }),
    });

    if (!response || !response.ok) {
      const data = response ? await response.json() : {};
      return NextResponse.json(
        { error: data.error || 'Failed to promote moderator' },
        { status: response ? response.status : 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in promote moderator API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
