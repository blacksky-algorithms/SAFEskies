'use server';

import { User } from '@/lib/types/user';
import { getIronSession, type IronSession } from 'iron-session';
import { ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';
import { cookies } from 'next/headers';

export type Session = {
  user: User | null;
};

export const getSession = async (): Promise<IronSession<Session>> => {
  const cookieStore = await cookies();
  console.log('YOOOOOOO', process.env.NODE_ENV);
  const session = await getIronSession<Session>(
    cookieStore as unknown as ResponseCookies,
    {
      cookieName: 'sid',
      password: process.env.COOKIE_PASSWORD as string,
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
    }
  );
  return session;
};
