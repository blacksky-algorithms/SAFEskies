import { BLUE_SKY_CLIENT_META_DATA } from '@/lib/utils/consts';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(BLUE_SKY_CLIENT_META_DATA, {
    status: 200,
  });
}
