import { NextResponse, NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { type Session } from '@/repos/iron';
import { getHighestRoleForUser } from '@/repos/permission';

export async function middleware(req: NextRequest) {
  const publicPaths = [
    '/oauth/login',
    '/oauth/callback',
    '/static',
    '/favicon.ico',
    '/robots.txt',
  ];

  if (req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((path) => {
    if (path.includes('.')) {
      return req.nextUrl.pathname === path;
    }

    return (
      req.nextUrl.pathname.startsWith(path + '/') ||
      req.nextUrl.pathname === path
    );
  });

  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    const session = await getIronSession<Session>(await cookies(), {
      cookieName: 'sid',
      password: process.env.COOKIE_PASSWORD as string,
    });

    if (!session?.user?.did) {
      return NextResponse.redirect(new URL('/oauth/login', req.url));
    }

    const userHighestRole = await getHighestRoleForUser(session.user.did);

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (userHighestRole !== 'admin') {
        console.log('Unauthorized admin access attempt');
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
    }

    if (
      req.nextUrl.pathname.startsWith('/mod') ||
      req.nextUrl.pathname.startsWith('/logs')
    ) {
      if (!['admin', 'mod'].includes(userHighestRole)) {
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/oauth/login', req.url));
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/mod/:path*',
    // The root admin and mod paths
    '/admin',
    '/mod',
  ],
};
