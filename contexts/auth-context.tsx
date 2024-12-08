'use client';
// https://github.com/pirmax/bluesky-oauth-nextjs/blob/main/.env.example
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BrowserOAuthClient,
  OAuthSession,
} from '@atproto/oauth-client-browser';

interface AuthContextProps {
  isAuthenticated: boolean;
  initializeAuth: (username: string) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [client, setClient] = useState<BrowserOAuthClient | null>(null);
  const [session, setSession] = useState<OAuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error(
        'NEXT_PUBLIC_CLIENT_ID must be defined in environment variables.'
      );
      return;
    }

    const initializeClient = async () => {
      //   const loadedClient = await BrowserOAuthClient.load({
      //     clientId,
      //     responseMode: 'fragment',
      //     handleResolver: async (username) => {
      //       // Implement handle resolution, e.g., a request to resolve username
      //       const response = await fetch(
      //         `/api/resolve-handle?username=${username}`
      //       );
      //       if (!response.ok) {
      //         throw new Error('Failed to resolve handle');
      //       }
      //       const data = await response.json();
      //       return data.pds;
      //     },
      //   });

      try {
        const oauthClient = await BrowserOAuthClient.load({
          clientId,
          handleResolver: 'https://bsky.social/', //TODO: talk to Rudy about handle resolution see Caution in https://github.com/bluesky-social/atproto/blob/main/packages/api/OAUTH.md
        });
        console.log({ oauthClient });
        debugger;
        setClient(oauthClient);
      } catch (err) {
        console.log('OAuth client initialization failed:', err);
      }
    };

    initializeClient().finally(() => setIsInitializing(false));
  }, [clientId]);
  console.log({ client });
  const initializeAuth = async (username: string) => {
    if (!client) {
      throw new Error('OAuth client not initialized');
    }

    const sessionData = await client.init(true);

    if (sessionData) {
      setSession(sessionData.session);
    }
  };

  const signIn = async () => {
    if (!client) {
      throw new Error('OAuth client not initialized');
    }

    const sessionData = await client.signIn('');
    setSession(sessionData);
  };

  const signOut = async () => {
    if (!client || !session) {
      throw new Error('Client or session not initialized');
    }

    await client.revoke(session.sub);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        initializeAuth,
        signIn,
        signOut,
      }}
    >
      {isInitializing ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
