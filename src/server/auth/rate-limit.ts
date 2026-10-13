import 'server-only';

// Slows down password guessing: after MAX_FAILURES wrong sign-ins from one address, that
// address waits out the window. Kept in memory, so it is per server instance and resets on a
// redeploy: a speed bump, not a wall. The real protection is a long, unique password.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED = 5000;

const failures = new Map<string, { count: number; resetAt: number }>();

function current(key: string, now: number) {
  const entry = failures.get(key);
  if (entry && entry.resetAt <= now) {
    failures.delete(key);
    return undefined;
  }
  return entry;
}

/** Minutes left to wait, or 0 if another attempt is allowed. */
export function loginLockMinutes(key: string, now: number = Date.now()): number {
  const entry = current(key, now);
  if (!entry || entry.count < MAX_FAILURES) return 0;
  return Math.max(1, Math.ceil((entry.resetAt - now) / 60000));
}

export function recordLoginFailure(key: string, now: number = Date.now()): void {
  const entry = current(key, now);
  if (entry) {
    entry.count += 1;
    return;
  }
  if (failures.size >= MAX_TRACKED) {
    // drop the oldest entry rather than grow without bound
    const oldest = failures.keys().next().value;
    if (oldest !== undefined) failures.delete(oldest);
  }
  failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
}

export function clearLoginFailures(key: string): void {
  failures.delete(key);
}
