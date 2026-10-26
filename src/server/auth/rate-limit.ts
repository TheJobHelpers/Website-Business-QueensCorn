import 'server-only';
import crypto from 'crypto';
import { requireAuthStore } from './kv';

// Slows down guessing. Failed sign-ins are counted in the sign-in database, so the limit holds
// across every server copy and through redeploys:
//   - per connection: 5 failures pause that address for 15 minutes
//   - per account:   10 failures (from anywhere) pause that account for 15 minutes, so spreading
//                    guesses over many addresses does not help.
// The pause ends on its own: an attacker can delay the owner's sign-in, never lock them out for good.

const WINDOW_SECONDS = 15 * 60;
const MAX_PER_ADDRESS = 5;
const MAX_PER_ACCOUNT = 10;

// addresses are hashed so the database does not keep a list of IPs just for counting
const addressKey = (address: string) =>
  `qc_auth:fail:ip:${crypto.createHash('sha256').update(address).digest('hex').slice(0, 32)}`;
const accountKey = (slot: string) => `qc_auth:fail:account:${slot}`;

async function count(key: string): Promise<number> {
  return Number((await requireAuthStore().get(key)) ?? 0);
}

/** Minutes to wait before another try, or 0 when a try is allowed. */
export async function signInPauseMinutes(address: string, accountSlot: string | null): Promise<number> {
  const blocked =
    (await count(addressKey(address))) >= MAX_PER_ADDRESS ||
    (accountSlot !== null && (await count(accountKey(accountSlot))) >= MAX_PER_ACCOUNT);
  return blocked ? WINDOW_SECONDS / 60 : 0;
}

export async function recordSignInFailure(address: string, accountSlot: string | null): Promise<void> {
  const store = requireAuthStore();
  await store.increment(addressKey(address), WINDOW_SECONDS);
  if (accountSlot !== null) await store.increment(accountKey(accountSlot), WINDOW_SECONDS);
}

export async function clearSignInFailures(address: string, accountSlot: string): Promise<void> {
  await requireAuthStore().del(addressKey(address), accountKey(accountSlot));
}
