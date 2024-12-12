import { createClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
// import type {
//   NodeSavedSession,
//   NodeSavedSessionStore,
//   NodeSavedState,
//   NodeSavedStateStore,
// } from '@atproto/oauth-client-node';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// Validate or Generate ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY is not defined. Generate one with "crypto.randomBytes(32).toString(\'base64\')" and set it in your environment variables.'
  );
}

// Decode and validate the encryption key
let ENCRYPTION_KEY_BUFFER: Buffer;
try {
  ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'base64');
  if (ENCRYPTION_KEY_BUFFER.length !== 32) {
    throw new Error('Decoded ENCRYPTION_KEY must be exactly 32 bytes long.');
  }
} catch (error) {
  throw new Error(
    'Invalid ENCRYPTION_KEY format. Ensure it is base64-encoded and represents exactly 32 bytes.'
  );
}

// Helper: Encrypt data
const encrypt = (data: string): { iv: string; encrypted: string } => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
};

// Helper: Decrypt data
const decrypt = ({
  iv,
  encrypted,
}: {
  iv: string;
  encrypted: string;
}): string => {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY_BUFFER,
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// StateStore implementation
export class StateStore {
  async get(key: string) {
    const { data, error } = await supabase
      .from('auth_states')
      .select('state')
      .eq('key', key)
      .single();

    if (error || !data) return undefined;
    const { iv, encrypted } = JSON.parse(data.state);
    return JSON.parse(decrypt({ iv, encrypted }));
  }

  async set(key: string, value: object) {
    const { iv, encrypted } = encrypt(JSON.stringify(value));
    const { error } = await supabase
      .from('auth_states')
      .upsert({ key, state: JSON.stringify({ iv, encrypted }) });

    if (error) {
      throw new Error(`Failed to save state for key ${key}: ${error.message}`);
    }
  }

  async del(key: string) {
    const { error } = await supabase
      .from('auth_states')
      .delete()
      .eq('key', key);
    if (error) {
      console.warn(`Failed to delete state for key ${key}:`, error);
    }
  }
}
// Session Store implementation
export class SessionStore {
  async get(key: string) {
    const { data, error } = await supabase
      .from('auth_sessions')
      .select('session')
      .eq('key', key)
      .single();

    if (error || !data) return undefined;
    const { iv, encrypted } = JSON.parse(data.session);
    return JSON.parse(decrypt({ iv, encrypted }));
  }

  async set(key: string, value: object) {
    const { iv, encrypted } = encrypt(JSON.stringify(value));
    const { error } = await supabase
      .from('auth_sessions')
      .upsert({ key, session: JSON.stringify({ iv, encrypted }) });

    if (error) {
      throw new Error(
        `Failed to save session for key ${key}: ${error.message}`
      );
    }
  }

  async del(key: string) {
    const { error } = await supabase
      .from('auth_sessions')
      .delete()
      .eq('key', key);
    if (error) {
      console.warn(`Failed to delete session for key ${key}:`, error);
    }
  }
}
