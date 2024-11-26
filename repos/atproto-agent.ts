import { AtpAgent } from '@atproto/api';

class AtpAgentSingleton {
  private static instance: AtpAgent;

  private constructor() {}

  public static getInstance(): AtpAgent {
    if (!AtpAgentSingleton.instance) {
      AtpAgentSingleton.instance = new AtpAgent({
        service: 'https://api.bsky.app',
      });
    }
    return AtpAgentSingleton.instance;
  }
}

export const AtprotoAgent = AtpAgentSingleton.getInstance();
