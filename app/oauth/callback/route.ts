'use server';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  }

  // Set cookies with the token and any other flags.
  const authTokenCookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;
  const refreshCookie = `needsRefresh=true; Path=/; SameSite=Strict`;

  // Instead of modifying the existing URL, create a new URL without the token.
  // For example, redirect to the home page.
  const redirectUrl = new URL('/', request.nextUrl.origin).toString();

  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
    </html>`,
    {
      status: 302,
      headers: {
        'Set-Cookie': `${authTokenCookie}, ${refreshCookie}`,
        Location: redirectUrl,
      },
    }
  );
}
