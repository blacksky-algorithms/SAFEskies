'use server';

import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';
import { getSession } from '@/repos/iron';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    const blueskyClient = BlueskyOAuthClient;

    const url = await blueskyClient.authorize(handle);

    return url.toString();
  } catch (error) {
    console.error(error);
    // TODO: Handle error
    return '';
  }
}

export async function signOutOfBlueSky(): Promise<void> {
  try {
    const session = await getSession();
    session.destroy(); // Clear session data
    await session.save(); // Persist destruction
  } catch (error) {
    console.error('Error during logout:', error);
    // TODO: Handle error
  }
}
