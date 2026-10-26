import 'server-only';
import crypto from 'crypto';

// Admin records kept in the database (people added from the dashboard, invites, and changes to
// anyone's password, phone or backup codes) are sealed with AES-256-GCM using ADMIN_DATA_KEY,
// which lives only in the server settings. Sealing hides the authenticator secrets and, just as
// important, makes the records tamper-proof: someone who can write to the database still cannot
// add an admin, raise a role, or swap in their own password or backup codes.

const KEY_BYTES = 32;

function dataKey(): Buffer | null {
  const raw = (process.env.ADMIN_DATA_KEY ?? '').trim();
  if (!raw) return null;
  const key = Buffer.from(raw, 'base64url');
  return key.length === KEY_BYTES ? key : null;
}

/** Whether admins can be managed from the dashboard on this server. */
export function dataKeyProblem(): string | null {
  if (!(process.env.ADMIN_DATA_KEY ?? '').trim()) return 'ADMIN_DATA_KEY is not set, so admins cannot be added or changed from the dashboard.';
  return dataKey() ? null : 'ADMIN_DATA_KEY must be 32 random bytes in base64url (scripts/admin-account.mjs prints one).';
}

export class DataKeyMissingError extends Error {
  constructor() {
    super(dataKeyProblem() ?? 'ADMIN_DATA_KEY is not set.');
    this.name = 'DataKeyMissingError';
  }
}

/** `label` ties the sealed value to where it is stored, so a record cannot be moved to another key. */
export function seal(value: unknown, label: string): string {
  const key = dataKey();
  if (!key) throw new DataKeyMissingError();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(label));
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), body.toString('base64url'), cipher.getAuthTag().toString('base64url')].join('.');
}

/** The value, or null when it is missing, was sealed for another place, or has been tampered with. */
export function unseal<T>(sealed: string | null, label: string): T | null {
  const key = dataKey();
  if (!key || !sealed) return null;
  const [version, iv, body, tag] = sealed.split('.');
  if (version !== 'v1' || !iv || !body || !tag) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    decipher.setAAD(Buffer.from(label));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const text = Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8');
    return JSON.parse(text) as T;
  } catch {
    console.error(`An admin record (${label}) failed its integrity check and was ignored.`);
    return null;
  }
}
