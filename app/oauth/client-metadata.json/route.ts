import { blueskyClientMetadata } from '@/repos/auth-repo';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(blueskyClientMetadata(), {
    status: 200,
  });
}
