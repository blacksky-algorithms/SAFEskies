'use server';

import { createBlueskyOAuthClient } from '@/repos/auth-repo';
import { getSession } from '@/repos/iron';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    const blueskyClient = await createBlueskyOAuthClient();

    const url = await blueskyClient.authorize(handle);

    return url.toString();
  } catch (error) {
    // TODO: Handle error
    throw new Error('Bluesky sign-in failed');
  }
}

export async function signOutOfBlueSky(): Promise<void> {
  try {
    // Get the session
    const session = await getSession();

    // Destroy the session
    session.destroy();
  } catch (error) {
    // TODO: Handle error
    throw new Error('Failed to sign out');
  }
}
