export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const response = await fetchWithAuth(`/api/logs${url.search}`, {
      method: 'GET',
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : {};
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch logs' },
        { status: response ? response.status : 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/logs proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
