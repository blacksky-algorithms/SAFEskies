'use server';

import { User } from '@/types/user';
import { getIronSession, type IronSession } from 'iron-session';
import { ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';
import { cookies } from 'next/headers';

export type Session = {
  user: User | null;
};

export const getSession = async (): Promise<IronSession<Session>> => {
  const cookieStore = await cookies();
  const session = await getIronSession<Session>(
    cookieStore as unknown as ResponseCookies,
    {
      cookieName: 'sid',
      password: process.env.COOKIE_PASSWORD as string,
    }
  );
  return session;
};

export const getSessionUser = async (): Promise<
  IronSession<Session> | Session
> => {
  const ironSession = await getSession();

  return {
    user: ironSession.user ? { ...ironSession.user } : null,
  };
};
