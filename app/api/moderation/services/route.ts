import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const uri = searchParams.get('uri');

    const response = await fetchWithAuth(
      `/api/moderation/services?uri=${uri}`,
      {
        method: 'GET',
      }
    );
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
