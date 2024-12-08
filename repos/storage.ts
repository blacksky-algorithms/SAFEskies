import { PrismaClient } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node';

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
export class StateStore implements NodeSavedStateStore {
  constructor(private prisma: PrismaClient) {}

  async get(key: string): Promise<NodeSavedState | undefined> {
    const record = await this.prisma.authState.findUnique({ where: { key } });
    if (!record) return undefined;

    try {
      const { iv, encrypted } = JSON.parse(record.state);
      const decrypted = decrypt({ iv, encrypted });
      return JSON.parse(decrypted) as NodeSavedState;
    } catch (error) {
      console.error(`Failed to decrypt state for key ${key}:`, error);
      return undefined;
    }
  }

  async set(key: string, value: NodeSavedState): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const { iv, encrypted } = encrypt(serialized);

      await this.prisma.authState.upsert({
        where: { key },
        update: { state: JSON.stringify({ iv, encrypted }) },
        create: { key, state: JSON.stringify({ iv, encrypted }) },
      });
    } catch (error) {
      console.error(`Failed to save state for key ${key}:`, error);
      throw new Error('Failed to save state');
    }
  }

  async del(key: string): Promise<void> {
    await this.prisma.authState.delete({ where: { key } }).catch((error) => {
      console.warn(`Failed to delete state for key ${key}:`, error);
    });
  }
}

// SessionStore implementation
export class SessionStore implements NodeSavedSessionStore {
  constructor(private prisma: PrismaClient) {}

  async get(key: string): Promise<NodeSavedSession | undefined> {
    const record = await this.prisma.authSession.findUnique({ where: { key } });
    if (!record) return undefined;

    try {
      const { iv, encrypted } = JSON.parse(record.session);
      const decrypted = decrypt({ iv, encrypted });
      return JSON.parse(decrypted) as NodeSavedSession;
    } catch (error) {
      console.error(`Failed to decrypt session for key ${key}:`, error);
      return undefined;
    }
  }

  async set(key: string, value: NodeSavedSession): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const { iv, encrypted } = encrypt(serialized);

      await this.prisma.authSession.upsert({
        where: { key },
        update: { session: JSON.stringify({ iv, encrypted }) },
        create: { key, session: JSON.stringify({ iv, encrypted }) },
      });
    } catch (error) {
      console.error(`Failed to save session for key ${key}:`, error);
      throw new Error('Failed to save session');
    }
  }

  async del(key: string): Promise<void> {
    await this.prisma.authSession.delete({ where: { key } }).catch((error) => {
      console.warn(`Failed to delete session for key ${key}:`, error);
    });
  }
}
