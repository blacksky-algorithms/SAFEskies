import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const cursor = searchParams.get('cursor');

    const url = cursor
      ? `/api/moderation/escalated-users?limit=${limit}&cursor=${encodeURIComponent(cursor)}`
      : `/api/moderation/escalated-users?limit=${limit}`;

    const response = await fetchWithAuth(url);

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to fetch escalated users' },
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
        { error: data.error || 'Failed to fetch escalated users' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch escalated users',
      },
      { status: 500 }
    );
  }
}