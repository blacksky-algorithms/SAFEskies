import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.did) {
      return NextResponse.json(
        { error: 'Missing required field: did' },
        { status: 400 }
      );
    }

    if (!body.eventType) {
      return NextResponse.json(
        { error: 'Missing required field: eventType' },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetchWithAuth('/api/moderation/emit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to emit moderation event' },
        { status: 500 }
      );
    }

    // Parse response safely
    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      return NextResponse.json(
        {
          error: jsonError instanceof Error
            ? jsonError.message
            : 'Invalid JSON returned from backend',
          raw: rawText,
        },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to emit moderation event' },
        { status: response.status }
      );
    }

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
