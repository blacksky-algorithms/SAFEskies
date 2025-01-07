import { BlueskyOAuthClient } from '@/repos/blue-sky-oauth-client';

export const makeAuthenticatedRequest = async (
  userDid: string,
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  // Restore the session for the specified user DID
  const session = await BlueskyOAuthClient.restore(userDid);
  if (!session) {
    throw new Error(`Failed to restore session for user DID: ${userDid}`);
  }

  // Use the fetchHandler of the session to make the authenticated request
  return session.fetchHandler(endpoint, options);
};
