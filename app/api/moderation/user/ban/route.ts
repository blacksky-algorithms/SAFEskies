import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

// GET - Check ban status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const actor = searchParams.get('actor');
    const limit = searchParams.get('limit') || '1';

    if (!actor) {
      return NextResponse.json(
        { error: 'Missing required parameter: actor' },
        { status: 400 }
      );
    }

    const response = await fetchWithAuth(
      `/api/moderation/user/ban?actor=${encodeURIComponent(actor)}&limit=${limit}`
    );

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to check ban status' },
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
        { error: data.error || 'Failed to check ban status' },
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

// POST - Ban user
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.actor) {
      return NextResponse.json(
        { error: 'Missing required field: actor' },
        { status: 400 }
      );
    }

    const response = await fetchWithAuth('/api/moderation/user/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response) {
      return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
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
        { error: data.error || 'Failed to ban user' },
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

// DELETE - Unban user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const actor = searchParams.get('actor');

    if (!actor) {
      return NextResponse.json(
        { error: 'Missing required parameter: actor' },
        { status: 400 }
      );
    }

    const response = await fetchWithAuth(
      `/api/moderation/user/ban?actor=${encodeURIComponent(actor)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to unban user' },
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
        { error: data.error || 'Failed to unban user' },
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