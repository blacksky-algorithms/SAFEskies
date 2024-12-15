'use server';

import { createBlueskyOAuthClient } from '@/repos/auth-repo';
import { getSession } from '@/repos/iron';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    const blueskyClient = await createBlueskyOAuthClient();

    const url = await blueskyClient.authorize(handle);

    return url.toString();
  } catch (error) {
    console.error(error);
    // TODO: Handle error
    throw new Error('Bluesky sign-in failed');
  }
}

export async function signOutOfBlueSky(): Promise<void> {
  try {
    const session = await getSession();
    session.destroy(); // Clear session data
    await session.save(); // Persist destruction
  } catch (error) {
    console.error('Error during logout:', error);
    throw new Error('Failed to sign out.');
  }
}
