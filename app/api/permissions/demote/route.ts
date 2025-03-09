import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modDid, uri, setByUserDid, feedName } = body;

    // Validate required fields.
    if (!modDid || !uri || !setByUserDid || !feedName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward the request to the Node API endpoint.
    const response = await fetchWithAuth('/api/permissions/admin/demote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modDid, uri, setByUserDid, feedName }),
    });

    if (!response || !response.ok) {
      const data = response ? await response.json() : {};
      return NextResponse.json(
        { error: data.error || 'Failed to demote moderator' },
        { status: response ? response.status : 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
