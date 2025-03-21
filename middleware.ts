import { NextResponse, NextRequest } from 'next/server';
import { getProfile } from './repos/profile';
import { getHighestRoleForUser } from './lib/utils/permission';

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
    const profile = await getProfile();

    if (!profile?.did) {
      return NextResponse.redirect(new URL('/oauth/login', req.url));
    }

    const userHighestRole = await getHighestRoleForUser(profile.rolesByFeed);

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (userHighestRole !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    if (
      req.nextUrl.pathname.startsWith('/mod') ||
      req.nextUrl.pathname.startsWith('/logs')
    ) {
      if (!['admin', 'mod'].includes(userHighestRole)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch (error: unknown) {
    return NextResponse.redirect(new URL('/oauth/login', req.url));
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/mod/:path*',
    '/admin',
    '/mod',
    '/logs',
  ],
};
