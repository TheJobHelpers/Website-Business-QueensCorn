import 'server-only';
import crypto from 'crypto';
import QRCode from 'qrcode';
import type { ActiveAccount } from './directory';
import { requireAuthStore } from './kv';
import { seal, unseal } from './sealed';
import { decodeBase32, encodeBase32, newTotpSecret, otpauthLink } from './totp';

// Adding a phone to an account.
//
// First sign-in of a super admin (made with scripts/admin-account.mjs): after the right email and
// password, an account whose phone is not set up yet is shown its QR code once; the first code
// from the app finishes the setup. The "set up" mark belongs to the account's current secret, so
// a new secret (lost phone) brings the QR back at the next sign-in.
//
// Replacing a phone from Settings: after the password and a current code, a new secret is held
// for 10 minutes; the first code from the new phone makes it the account's secret.

const SETUP_SECONDS = 10 * 60;

const secretTag = (secret: Buffer) => crypto.createHash('sha256').update(secret).digest('hex').slice(0, 16);
const enrolledKey = (account: ActiveAccount) => `qc_auth:enrolled:${account.id}:${secretTag(account.totpSecret)}`;
const setupKey = (token: string) => `qc_auth:setup:${crypto.createHash('sha256').update(token).digest('hex')}`;
const replacementKey = (account: ActiveAccount) => `qc_auth:new-phone:${account.id}`;

export async function isPhoneSetUp(account: ActiveAccount): Promise<boolean> {
  return (await requireAuthStore().get(enrolledKey(account))) !== null;
}

/** Marks the phone for this secret as set up (the account object must carry the new secret). */
export async function markPhoneSetUp(account: ActiveAccount): Promise<void> {
  await requireAuthStore().set(enrolledKey(account), new Date().toISOString());
}

/** A short-lived setup ticket, kept in an http-only cookie so the password need not be sent twice. */
export async function startPhoneSetup(account: ActiveAccount): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await requireAuthStore().set(setupKey(token), `${account.id}:${secretTag(account.totpSecret)}`, { ttlSeconds: SETUP_SECONDS });
  return token;
}

/** The account the ticket was issued for, if the ticket is still valid and the secret unchanged. */
export async function readPhoneSetup(token: string, accounts: ActiveAccount[]): Promise<ActiveAccount | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const value = await requireAuthStore().get(setupKey(token));
  if (!value) return null;
  const [id, tag] = value.split(':');
  const account = accounts.find((a) => a.id === id);
  return account && secretTag(account.totpSecret) === tag ? account : null;
}

export async function endPhoneSetup(token: string): Promise<void> {
  await requireAuthStore().del(setupKey(token));
}

export const SETUP_COOKIE = 'qc_admin_setup';
export const SETUP_COOKIE_SECONDS = SETUP_SECONDS;

/** Settings > Replace my phone: a new secret waiting for its first code. */
export async function startPhoneReplacement(account: ActiveAccount): Promise<Buffer> {
  const secret = newTotpSecret();
  await requireAuthStore().set(replacementKey(account), seal(encodeBase32(secret), replacementKey(account)), { ttlSeconds: SETUP_SECONDS });
  return secret;
}

export async function pendingPhoneReplacement(account: ActiveAccount): Promise<Buffer | null> {
  const sealed = unseal<string>(await requireAuthStore().get(replacementKey(account)), replacementKey(account));
  return sealed ? decodeBase32(sealed) : null;
}

export async function endPhoneReplacement(account: ActiveAccount): Promise<void> {
  await requireAuthStore().del(replacementKey(account));
}

export interface PhoneSetup {
  /** the QR code as an SVG data URL */
  qr: string;
  /** the same secret, for typing in by hand ("XXXX XXXX ...") */
  key: string;
}

export async function phoneSetupDetails(email: string, secret: Buffer): Promise<PhoneSetup> {
  const svg = await QRCode.toString(otpauthLink(email, secret), { type: 'svg', margin: 2, errorCorrectionLevel: 'M' });
  return {
    qr: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    key: encodeBase32(secret).match(/.{1,4}/g)?.join(' ') ?? '',
  };
}
