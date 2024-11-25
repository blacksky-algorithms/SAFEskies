// utils/oauthClient.ts
import {
  BrowserOAuthClient,
  AtprotoDohHandleResolver,
} from '@atproto/oauth-client-browser';

export const createOAuthClient = async () => {
  const handleResolver = new AtprotoDohHandleResolver({
    dohEndpoint: process.env.NEXT_PUBLIC_HANDLE_RESOLVER || '',
  });

  const client = await BrowserOAuthClient.load({
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    handleResolver,
  });

  return client;
};
