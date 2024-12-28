import { NextRequest } from 'next/server';
import { AuthenticationHandler } from '@/services/auth-manager';

export async function GET(request: NextRequest) {
  return AuthenticationHandler.handleOAuthCallback(request);
}
