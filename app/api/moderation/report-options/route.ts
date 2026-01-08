import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetchWithAuth('/api/moderation/report-options');

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to fetch report options' },
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
        { error: data.error || 'Failed to fetch report options' },
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
