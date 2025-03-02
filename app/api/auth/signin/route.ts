// app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_SAFE_SKIES_API
      }/auth/signin?handle=${encodeURIComponent(handle)}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to sign in' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in signin API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
