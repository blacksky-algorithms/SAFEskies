'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  }

  const authTokenCookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;
  const refreshCookie = `needsRefresh=true; Path=/; SameSite=Strict`;
  // Because we are hosting on netlify, we need to do a full redirect with the token param removed
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_CLIENT_URL}/?uri=`, {
    status: 302,
    headers: {
      'Set-Cookie': `${authTokenCookie}, ${refreshCookie}`,
    },
  });
}
