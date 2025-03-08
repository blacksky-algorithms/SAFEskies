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
  } catch (error) {
    console.error('Error in Next API route for moderation services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
