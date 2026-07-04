import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'smart-interview-coach-super-secret-key-2026';

// Schema interfaces
interface DatabaseSchema {
  users: any[];
  resumes: any[];
  interviews: any[];
  evaluations: any[];
  recommendations: any[];
}

const initialDb: DatabaseSchema = {
  users: [],
  resumes: [],
  interviews: [],
  evaluations: [],
  recommendations: [],
};

// Ensure db exists
async function ensureDb() {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error creating database folder:', err);
  }
}

// Read and Write Database
export async function readDb(): Promise<DatabaseSchema> {
  await ensureDb();
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return initialDb;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Security Utilities
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === newHash;
  } catch {
    return false;
  }
}

export function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');
  return `${header}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const [header, payloadB64, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payloadB64}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
