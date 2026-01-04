import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    const { did } = await params;

    if (!did) {
      return NextResponse.json(
        { error: 'Missing required parameter: did' },
        { status: 400 }
      );
    }

    const response = await fetchWithAuth(
      `/api/moderation/profile/${encodeURIComponent(did)}`
    );

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to fetch profile moderation data' },
        { status: 500 }
      );
    }

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      return NextResponse.json(
        {
          error:
            jsonError instanceof Error
              ? jsonError.message
              : 'Invalid JSON returned from backend',
          raw: rawText,
        },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch profile moderation data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch profile moderation data',
      },
      { status: 500 }
    );
  }
}