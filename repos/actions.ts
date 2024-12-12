'use server';

import { createBlueskyOAuthClient } from '@/repos/auth-repo';
import { getSession } from '@/repos/iron';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    console.log('Creating Bluesky OAuth client...');
    const blueskyClient = await createBlueskyOAuthClient();

    console.log('Generating authorization URL...');
    const url = await blueskyClient.authorize(handle);

    console.log('Authorization URL generated:', url.toString());
    return url.toString();
  } catch (error) {
    console.error('Bluesky sign-in failed:', { error });
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
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}
