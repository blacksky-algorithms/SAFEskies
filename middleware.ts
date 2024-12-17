import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/repos/iron';
// import { getUserProfile } from '@/repos/user';

const isAuthenticated = async (req: NextRequest) => {
  const session = await getSession();
  return session?.user || null;
};

// const isAdmin = async (req: NextRequest) => {
//   const session = await getSession();
//   if (!session?.user) return false;

//   const profile = await getUserProfile();
//   return profile?.roles?.includes('admin') || false;
// };

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Protect `/mod` routes
  if (url.pathname.startsWith('/mod')) {
    const user = await isAuthenticated(req);
    if (!user) {
      url.pathname = '/oauth/login';
      return NextResponse.redirect(url);
    }
  }

  // // TODO: Protect `/admin` routes with role-based access
  // if (url.pathname.startsWith('/admin')) {
  //   const isUserAdmin = await isAdmin(req);
  //   if (!isUserAdmin) {
  //     url.pathname = '/not-authorized';
  //     return NextResponse.redirect(url);
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mod/:path*', '/admin/:path*'], // Match protected routes
};
