import { SessionStore, StateStore } from '@/repos/storage';
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { BLUE_SKY_CLIENT_META_DATA } from '@/utils/consts';

// Singleton Class for Bluesky OAuth Client
class BlueskyOAuthClientSingleton {
  private static instance: NodeOAuthClient;

  private constructor() {} // Prevent instantiation from outside

  public static getInstance(): NodeOAuthClient {
    if (!BlueskyOAuthClientSingleton.instance) {
      BlueskyOAuthClientSingleton.instance = new NodeOAuthClient({
        clientMetadata: BLUE_SKY_CLIENT_META_DATA,
        stateStore: new StateStore(),
        sessionStore: new SessionStore(),
      });
    }
    return BlueskyOAuthClientSingleton.instance;
  }
}

// Export Singleton Instance
export const BlueskyOAuthClient = BlueskyOAuthClientSingleton.getInstance();
