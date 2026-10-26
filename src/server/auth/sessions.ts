import 'server-only';
import crypto from 'crypto';
import { requireAuthStore } from './kv';
import { SESSION_IDLE_SECONDS, SESSION_MAX_SECONDS, newSessionId } from './session';

// Signed-in sessions, kept in the sign-in database. Only a hash of each session id is stored, so
// reading the database does not give anyone a working cookie.

export interface AdminSession {
  email: string;
  /** seconds since epoch */
  startedAt: number;
  lastSeenAt: number;
  expiresAt: number;
}

/** Don't write "still here" more than once a minute. */
const TOUCH_EVERY_SECONDS = 60;

const hashId = (id: string) => crypto.createHash('sha256').update(id).digest('hex');
const sessionKey = (hashedId: string) => `qc_auth:session:${hashedId}`;
const indexKey = (email: string) => `qc_auth:sessions:${email}`;
const seconds = (now: number) => Math.floor(now / 1000);

/** Seconds the stored session lives on: until idle runs out, but never past the hard limit. */
const ttl = (session: AdminSession, now: number) =>
  Math.min(SESSION_IDLE_SECONDS, session.expiresAt - seconds(now));

export async function createSession(email: string, now: number = Date.now()): Promise<string> {
  const store = requireAuthStore();
  const id = newSessionId();
  const hashed = hashId(id);
  const session: AdminSession = {
    email,
    startedAt: seconds(now),
    lastSeenAt: seconds(now),
    expiresAt: seconds(now) + SESSION_MAX_SECONDS,
  };
  await store.set(sessionKey(hashed), JSON.stringify(session), { ttlSeconds: ttl(session, now) });

  // forget sessions of this person that have already ended
  for (const old of await store.setMembers(indexKey(email))) {
    if ((await store.get(sessionKey(old))) === null) await store.removeFromSet(indexKey(email), old);
  }
  await store.addToSet(indexKey(email), hashed);
  return id;
}

/** The live session for this id, or null if it never existed, was ended, or ran out. */
export async function loadSession(id: string, now: number = Date.now()): Promise<AdminSession | null> {
  const store = requireAuthStore();
  const key = sessionKey(hashId(id));
  const raw = await store.get(key);
  if (!raw) return null;

  let session: AdminSession;
  try {
    session = JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
  const at = seconds(now);
  if (typeof session.email !== 'string' || at >= session.expiresAt || at - session.lastSeenAt >= SESSION_IDLE_SECONDS) {
    await store.del(key);
    return null;
  }

  if (at - session.lastSeenAt >= TOUCH_EVERY_SECONDS) {
    session = { ...session, lastSeenAt: at };
    await store.set(key, JSON.stringify(session), { ttlSeconds: ttl(session, now) });
  }
  return session;
}

export async function endSession(id: string, email?: string): Promise<void> {
  const store = requireAuthStore();
  const hashed = hashId(id);
  await store.del(sessionKey(hashed));
  if (email) await store.removeFromSet(indexKey(email), hashed);
}

/** On how many devices this person is signed in right now. */
export async function countSessions(email: string): Promise<number> {
  const store = requireAuthStore();
  let live = 0;
  for (const hashed of await store.setMembers(indexKey(email))) {
    if ((await store.get(sessionKey(hashed))) !== null) live += 1;
  }
  return live;
}

/** Signs this person out on every device. */
export async function endAllSessions(email: string): Promise<void> {
  const store = requireAuthStore();
  const hashed = await store.setMembers(indexKey(email));
  await store.del(...hashed.map(sessionKey), indexKey(email));
}
