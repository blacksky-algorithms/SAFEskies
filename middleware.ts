import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/repos/iron';
// import { getUserProfile } from '@/repos/user';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); // Correctly using `NextRequest`

  const session = await getSession();

  // If user is not authenticated
  if (!session?.user) {
    url.pathname = '/oauth/login';
    return NextResponse.redirect(url);
  }

  //   // For admin routes, enforce role-based access
  //   if (url.pathname.startsWith('/admin')) {
  //     const profile = await getUserProfile(session.user.did);

  //     if (!profile.roles?.includes('admin')) {
  //       url.pathname = '/not-authorized'; // Redirect to unauthorized page
  //       return NextResponse.redirect(url);
  //     }
  //   }

  return NextResponse.next();
}

// Define routes for middleware to protect
export const config = {
  matcher: ['/mod/:path*', '/admin/:path*'], // Protect these paths
};
