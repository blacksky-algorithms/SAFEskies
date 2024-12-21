// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { type Session } from '@/repos/iron';
import { getUserRole } from '@/repos/user';

export async function middleware(req: NextRequest) {
  // Let's be more specific about what constitutes a public path
  const publicPaths = [
    '/oauth/login',
    '/oauth/callback',
    '/static',
    '/favicon.ico',
    '/robots.txt',
  ];

  // We'll handle the root path separately since it needs special consideration
  if (req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // For truly public paths, we'll do an exact match or specific prefix check
  const isPublicPath = publicPaths.some((path) => {
    // Exact match for specific files
    if (path.includes('.')) {
      return req.nextUrl.pathname === path;
    }
    // Prefix match for directories, but only if the next character is / or nothing
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

    const userRole = await getUserRole(session.user.did);

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.log('Unauthorized admin access attempt');
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith('/mod')) {
      if (!['admin', 'mod'].includes(userRole)) {
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/oauth/login', req.url));
  }
}

// Our matcher should be specific about which paths to protect
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
