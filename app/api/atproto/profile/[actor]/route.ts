import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export async function GET(request: Request, { params }: { params: Promise<{ actor: string }> }) {
  try {
    const { actor } = await params;

    if (!actor) {
      return NextResponse.json(
        { error: 'Actor parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetchWithAuth(`/api/atproto/profile/${encodeURIComponent(actor)}`, {
      method: 'GET',
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : {};
      return NextResponse.json(
        { error: errorData.error || 'Failed to get profile' },
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
