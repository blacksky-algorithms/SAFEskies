'use server';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  } else {
    const authTokenCookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;
    const refreshCookie = `needsRefresh=true; Path=/; SameSite=Strict`;

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta http-equiv="refresh" content="0;url=/" />
          <title>Redirecting...</title>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
      `,
      {
        status: 302,
        headers: {
          'Set-Cookie': `${authTokenCookie}, ${refreshCookie}`,
          Location: '/',
        },
      }
    );
  }
}
