import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Forward the GET request with the query param to the Node API.
    const response = await fetchWithAuth('/api/moderation/services', {
      method: 'GET',
    });
    const data = await response?.json();
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
