'use server';

import { createBlueskyOAuthClient } from '@/repos/auth-repo';
import { getSession } from '@/repos/iron';
import { prisma } from '@/repos/prisma';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    // Create a Bluesky client
    const blueskyClient = await createBlueskyOAuthClient(prisma);

    // Get the URL to authorize the user
    const url: URL = await blueskyClient.authorize(handle);
    // Return the URL
    return url.toString();
  } catch (error) {
    console.error('Error signing in with Bluesky:', error);
    throw new Error('Failed to sign in with Bluesky');
    debugger;
  }
}

export async function signOut(): Promise<void> {
  // Get the session
  const session = await getSession();

  // Destroy the session
  session.destroy();
}
