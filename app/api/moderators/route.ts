// app/api/moderators/route.ts
import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request) {
  try {
    // Parse the incoming URL for query parameters.
    const { searchParams } = new URL(request.url);
    const feed = searchParams.get('feed');

    // Build the URL to the Node API endpoint.
    // If a feed query is provided, include it; otherwise, use the base endpoint.
    const endpoint = feed
      ? `/api/permissions/admin/moderators?feed=${encodeURIComponent(feed)}`
      : '/api/permissions/admin/moderators';

    // Use your fetchWithAuth helper to forward the request.
    const response = await fetchWithAuth(endpoint, { method: 'GET' });

    // If the response is not OK, forward the error.
    if (!response || !response.ok) {
      const data = response ? await response.json() : {};
      return NextResponse.json(
        { error: data.error || 'Failed to fetch moderators' },
        { status: response ? response.status : 500 }
      );
    }

    // Return the data received from the Node API.
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Next API moderators route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
