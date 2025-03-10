'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  }

  // Set cookies with the token and any other flags.
  const authTokenCookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;
  const refreshCookie = `needsRefresh=true; Path=/; SameSite=Strict`;

  return NextResponse.redirect(`${request.nextUrl.origin}/?uri=`, {
    status: 302,
    headers: {
      'Set-Cookie': `${authTokenCookie}, ${refreshCookie}`,
    },
  });
}
