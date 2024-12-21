import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import supabase from '@/repos/supabase';

// Encryption Setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not defined.');
}
const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'base64');
if (ENCRYPTION_KEY_BUFFER.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 bytes.');
}

const encrypt = (data: string) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
  return {
    iv: iv.toString('hex'),
    encrypted: cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
  };
};

const decrypt = ({ iv, encrypted }: { iv: string; encrypted: string }) => {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY_BUFFER,
    Buffer.from(iv, 'hex')
  );
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

// State Store
export class StateStore {
  async get(key: string) {
    const { data } = await supabase
      .from('auth_states')
      .select('state')
      .eq('key', key)
      .single();
    if (!data) return undefined;
    return JSON.parse(decrypt(JSON.parse(data.state)));
  }

  async set(key: string, value: object) {
    const { iv, encrypted } = encrypt(JSON.stringify(value));
    await supabase
      .from('auth_states')
      .upsert({ key, state: JSON.stringify({ iv, encrypted }) });
  }

  async del(key: string) {
    await supabase.from('auth_states').delete().eq('key', key);
  }
}

// Session Store
export class SessionStore {
  async get(key: string) {
    const { data } = await supabase
      .from('auth_sessions')
      .select('session')
      .eq('key', key)
      .single();
    if (!data) return undefined;
    return JSON.parse(decrypt(JSON.parse(data.session)));
  }

  async set(key: string, value: object) {
    const { iv, encrypted } = encrypt(JSON.stringify(value));
    await supabase
      .from('auth_sessions')
      .upsert({ key, session: JSON.stringify({ iv, encrypted }) });
  }

  async del(key: string) {
    await supabase.from('auth_sessions').delete().eq('key', key);
  }
}
