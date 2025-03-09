'use server';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  } else {
    const authTokenCookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;
    const refreshCookie = `needsRefresh=true; Path=/; SameSite=Strict`;
    // Remove the token from the URL by setting it to an empty string.
    // This avoids leaving the token in the final URL particularly on netlify deploys.
    request.nextUrl.searchParams.delete('token', '');
    request.nextUrl.searchParams.set('uri', '');
    const redirectUrl = request.nextUrl.toString();

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
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
