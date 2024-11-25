'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserOAuthClient } from '@atproto/oauth-client-browser';

const OAuthContext = createContext<BrowserOAuthClient | null>(null);

export const useOAuthClient = () => {
  const client = useContext(OAuthContext);
  if (!client) {
    throw new Error('useOAuthClient must be used within OAuthProvider');
  }
  return client;
};

export const OAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<BrowserOAuthClient | null>(null);

  useEffect(() => {
    const initClient = () => {
      const oauthClient = new BrowserOAuthClient({
        clientMetadata: {
          client_id: 'https://feed-moderator.netlify.app/client-metadata.json',
          client_name: 'BlueSky Feed Moderator',
          redirect_uris: ['https://feed-moderator.netlify.app/callback'],
          scope: 'atproto',
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
          dpop_bound_access_tokens: true,
        },
        handleResolver: 'https://bsky.social',
      });
      setClient(oauthClient);
    };

    initClient();
  }, []);

  if (!client) return <p>Loading OAuth client...</p>;

  return (
    <OAuthContext.Provider value={client}>{children}</OAuthContext.Provider>
  );
};

// export default function App({ Component, pageProps }: any) {
//   return (
//     <OAuthProvider>
//       <Component {...pageProps} />
//     </OAuthProvider>
//   );
// }
