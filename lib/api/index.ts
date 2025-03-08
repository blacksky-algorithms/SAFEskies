'use server';

import { cookies } from 'next/headers';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      console.warn('No auth token found');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SAFE_SKIES_API}${url}`,
      { ...options, headers }
    );
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    return response;
  } catch (e) {
    console.error(e);
  }
}
