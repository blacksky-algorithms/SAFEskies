'use server';

import { createBlueskyOAuthClient } from '@/repos/auth-repo';
import { getSession } from '@/repos/iron';
import { prisma } from '@/repos/prisma';

export async function signInWithBluesky(handle: string): Promise<string> {
  try {
    console.log('Starting Bluesky sign-in process for handle:', handle);

    // Check Prisma connection
    console.log('Testing Prisma connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Prisma connection successful.');

    // Create a Bluesky client
    console.log('Creating Bluesky OAuth client...');
    const blueskyClient = await createBlueskyOAuthClient(prisma);

    // Get the URL to authorize the user
    console.log('Generating authorization URL...');
    const url: URL = await blueskyClient.authorize(handle);

    console.log('Authorization URL generated:', url.toString());
    return url.toString();
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('Detailed error during sign-in:', error);
    throw new Error(`Bluesky sign-in failed: ${errMessage}`);
  }
}

export async function signOut(): Promise<void> {
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
