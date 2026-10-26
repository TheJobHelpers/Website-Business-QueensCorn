import 'server-only';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { getAuthStore } from './kv';

// The activity log on the "Admins & activity" screen: every sign-in, failed try and sign-out,
// and every change saved in the dashboard, with who did it, when, and from where. Kept for 30
// days in the sign-in database, then deleted.

const KEY = 'qc_auth:activity';
export const ACTIVITY_DAYS = 30;
/** a flood of failed tries must not grow the log without limit */
const MAX_ENTRIES = 5000;

export type ActivityKind =
  | 'signed-in'
  | 'signed-in-backup-code'
  | 'failed'
  | 'wrong-code'
  | 'paused'
  | 'signed-out'
  | 'signed-out-everywhere'
  | 'phone-set-up'
  | 'invite-accepted'
  | 'phone-replaced'
  | 'backup-codes-renewed'
  | 'password-changed'
  | 'change';

export interface ActivityEvent {
  /** ISO time */
  at: string;
  kind: ActivityKind;
  /** the account's email; for an address that is not an account, just "someone else" */
  who: string;
  address: string;
  device: string;
  /** for a change: what was done, e.g. "Flavor updated." */
  detail?: string;
}

/** A short "Chrome on Windows"-style label instead of the whole user-agent string. */
export function deviceLabel(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'A browser';
  const system = /iPhone|iPad/.test(userAgent)
    ? 'iPhone/iPad'
    : /Android/.test(userAgent)
      ? 'Android'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS X/.test(userAgent)
          ? 'Mac'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'an unknown system';
  return `${browser} on ${system}`;
}

/** Where the current request comes from, for the log. On Vercel these headers are set by Vercel itself. */
export async function requester(): Promise<{ address: string; device: string }> {
  const h = await headers();
  const address = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return { address: address.slice(0, 64), device: deviceLabel(h.get('user-agent') ?? '') };
}

const cutoff = (now: number) => now - ACTIVITY_DAYS * 24 * 60 * 60 * 1000;

/** Never throws: a log that cannot be written must not stop anyone signing in or saving. */
export async function recordActivity(event: Omit<ActivityEvent, 'at'>): Promise<void> {
  const now = Date.now();
  console.info(`Admin activity: ${event.kind} ${event.who} from ${event.address} (${event.device})${event.detail ? `: ${event.detail}` : ''}`);
  try {
    // the random id keeps two identical events in the same millisecond apart
    const value = JSON.stringify({ id: crypto.randomBytes(6).toString('hex'), at: new Date(now).toISOString(), ...event });
    await getAuthStore()?.addToTimeline(KEY, now, value, cutoff(now), MAX_ENTRIES);
  } catch (err) {
    console.error('Could not record the activity:', err);
  }
}

/** The last 30 days, newest first. */
export async function recentActivity(max = 1000, now: number = Date.now()): Promise<ActivityEvent[]> {
  const raw = (await getAuthStore()?.readTimeline(KEY, cutoff(now), max)) ?? [];
  return raw.flatMap((line) => {
    try {
      return [JSON.parse(line) as ActivityEvent];
    } catch {
      return [];
    }
  });
}
