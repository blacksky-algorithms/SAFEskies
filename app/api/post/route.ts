import { NextResponse } from 'next/server';
import { getPostThread } from '@/repos/post';
import { isThreadViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');

  if (!uri) {
    return NextResponse.json(
      { error: 'Poat URI is required' },
      { status: 400 }
    );
  }

  try {
    const response = await getPostThread(uri);
    if (response && 'error' in response) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }
    if (isThreadViewPost(response?.data.thread)) {
      return NextResponse.json(response.data.thread);
    } else {
      return NextResponse.json(null);
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch post thread',
      },
      { status: 500 }
    );
  }
}
