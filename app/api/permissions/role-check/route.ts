// app/api/permissions/admin/check-role/route.ts
import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Parse query parameters from the incoming request URL.
    const { searchParams } = new URL(request.url);
    const targetDid = searchParams.get('targetDid');
    const uri = searchParams.get('uri');

    if (!targetDid || !uri) {
      return NextResponse.json(
        { error: 'Missing required parameters: targetDid and uri' },
        { status: 400 }
      );
    }

    // Build the URL for the Node API endpoint.
    const endpoint = `/api/permissions/admin/check-role?targetDid=${encodeURIComponent(
      targetDid
    )}&uri=${encodeURIComponent(uri)}`;

    // Forward the request to your Node API using fetchWithAuth.
    const response = await fetchWithAuth(endpoint, { method: 'GET' });

    if (!response || !response.ok) {
      const data = response ? await response.json() : {};
      return NextResponse.json(
        { error: data.error || 'Failed to check role' },
        { status: response ? response.status : 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in check-role API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
