import { handleOAuthCallback } from '@/repos/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request);
}
