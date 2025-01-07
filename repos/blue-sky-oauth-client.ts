import { Mutex } from 'async-mutex';
import { SessionStore, StateStore } from '@/repos/storage';
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { BLUE_SKY_CLIENT_META_DATA } from '@/lib/constants';

// Simple lock implementation using async-mutex
const mutex = new Mutex();

const requestLock = async <T>(
  _name: string,
  fn: () => T | Promise<T> | PromiseLike<T>
): Promise<T> => {
  return await mutex.runExclusive(() => Promise.resolve(fn()));
};

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
        requestLock,
      });
    }
    return BlueskyOAuthClientSingleton.instance;
  }
}

// Export Singleton Instance
export const BlueskyOAuthClient = BlueskyOAuthClientSingleton.getInstance();
