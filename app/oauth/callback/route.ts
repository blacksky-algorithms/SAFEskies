import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  } else {
    const cookie = `authToken=${token}; Path=/; HttpOnly; SameSite=Strict`;

    return new Response('Redirecting...', {
      status: 302,
      headers: {
        'Set-Cookie': cookie,
        Location: '/',
      },
    });
  }
}
