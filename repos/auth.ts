'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const logIn = async (
  handle: string
): Promise<{
  status: number;
  url: string | null;
  error: string | null;
}> => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SAFE_SKIES_API
      }/auth/signin?handle=${encodeURIComponent(handle)}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to sign in');
    }
    const { url } = await response.json();

    return { error: null, url, status: 200 };
  } catch (error: unknown) {
    return {
      status: 500,
      error:
        (error instanceof Error ? error.message : 'Failed to sign in') ||
        'Failed to sign in',
      url: null,
    };
  }
};

export const logOut = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('authToken');

    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
};
