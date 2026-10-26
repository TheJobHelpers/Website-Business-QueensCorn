import 'server-only';
import crypto from 'crypto';

// The 6-digit codes from an authenticator app (TOTP, RFC 6238: SHA-1, 30-second steps), and the
// one-time backup codes for when the phone is lost. Must match scripts/admin-account.mjs.

const STEP_SECONDS = 30;
const DIGITS = 6;
/** a code from the step before or after also counts, for phone clocks that are slightly off */
const DRIFT_STEPS = 1;

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function decodeBase32(text: string): Buffer | null {
  const clean = text.replace(/[\s-]/g, '').replace(/=+$/, '').toUpperCase();
  if (!clean || /[^A-Z2-7]/.test(clean)) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function encodeBase32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

/** What the QR code holds: authenticator apps read the name, the account and the secret from it. */
export function otpauthLink(email: string, secret: Buffer): string {
  const issuer = encodeURIComponent("The Queen's Corn");
  return `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${encodeBase32(secret)}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

/** The code an authenticator app shows for this secret during time step `step`. */
export function totpCode(secret: Buffer, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = crypto.createHmac('sha1', secret).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const binary = mac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

export const currentStep = (now: number = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

/** How long a used code must stay remembered so it cannot be used twice. */
export const TOTP_REPLAY_SECONDS = STEP_SECONDS * (2 * DRIFT_STEPS + 2);

/**
 * The time step the code belongs to, or null if it is not valid now. Every candidate step is
 * compared, in constant time, so the response time does not hint at how close a guess was.
 */
export function matchTotp(secret: Buffer, code: string, now: number = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const given = Buffer.from(code);
  const step = currentStep(now);
  let matched: number | null = null;
  for (let drift = -DRIFT_STEPS; drift <= DRIFT_STEPS; drift += 1) {
    if (crypto.timingSafeEqual(Buffer.from(totpCode(secret, step + drift)), given)) matched = step + drift;
  }
  return matched;
}

/** 160 bits, as RFC 4226 recommends. */
export const newTotpSecret = () => crypto.randomBytes(20);

// no I, O, 0 or 1: easy to read off paper
const BACKUP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Ten new one-time codes to show once, and the hashes to keep. */
export function newBackupCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: 10 }, () => {
    const chars = [...crypto.randomBytes(10)].map((b) => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join('');
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
  return { codes, hashes: codes.map(hashBackupCode) };
}

/** Backup codes look like "K7P2M-9QX4T"; only their SHA-256 is kept in the server settings. */
export const normalizeBackupCode = (code: string) => code.replace(/[\s-]/g, '').toUpperCase();
export const looksLikeBackupCode = (code: string) => /^[A-Z2-9]{10}$/.test(normalizeBackupCode(code));
export const hashBackupCode = (code: string) =>
  crypto.createHash('sha256').update(normalizeBackupCode(code)).digest('hex');

/** The stored hash this backup code matches, if any (compared in constant time). */
export function matchBackupCode(code: string, storedHashes: string[]): string | null {
  const given = Buffer.from(hashBackupCode(code), 'hex');
  let matched: string | null = null;
  for (const stored of storedHashes) {
    if (crypto.timingSafeEqual(Buffer.from(stored, 'hex'), given)) matched = stored;
  }
  return matched;
}
