import { fetchWithAuth } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("aihrgijrgiha'righ'waihgh");
  try {
    const body = await request.json();

    // Forward the request to your Node API endpoint.
    const response = await fetchWithAuth('/api/moderation/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response) {
      return NextResponse.json({ error: 'Failed to report' }, { status: 500 });
    }

    // Log the raw text to help debug if JSON parsing fails.
    const rawText = await response.text();
    console.log('Raw response:', rawText);

    // Try parsing the raw text as JSON.
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON returned from backend', raw: rawText },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to promote moderator' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in promote moderator API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
