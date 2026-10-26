import 'server-only';

// Where sign-in keeps its state: sessions, failed-attempt counters, used codes and the sign-in
// history. Unlike the site data store (src/server/store), nothing here is ever cached, and it
// must be shared by every server copy, so production needs the Redis database.
//
//   redis    KV_REST_API_URL + KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair)
//   memory   local development without a database only. Resets when the dev server restarts.
//   on Vercel without a database, sign-in is switched off rather than run on per-copy memory.

export class AuthStoreUnavailableError extends Error {
  constructor(message = 'Sign-in needs the Redis database, and it is not connected on this server.') {
    super(message);
    this.name = 'AuthStoreUnavailableError';
  }
}

export interface AuthStore {
  kind: 'redis' | 'memory';
  get(key: string): Promise<string | null>;
  /** false when `onlyIfNew` is set and the key already exists */
  set(key: string, value: string, opts?: { ttlSeconds?: number; onlyIfNew?: boolean }): Promise<boolean>;
  del(...keys: string[]): Promise<void>;
  /** adds 1 and returns the new count; the count disappears `ttlSeconds` after the first one */
  increment(key: string, ttlSeconds: number): Promise<number>;
  /** true when the member was not in the set yet */
  addToSet(key: string, member: string): Promise<boolean>;
  setMembers(key: string): Promise<string[]>;
  removeFromSet(key: string, member: string): Promise<void>;
  /** A list ordered by time: adds `value` at `time` (ms), drops entries older than `keepFrom`, and keeps at most `maxEntries`. */
  addToTimeline(key: string, time: number, value: string, keepFrom: number, maxEntries: number): Promise<void>;
  /** entries at or after `from` (ms), newest first */
  readTimeline(key: string, from: number, max: number): Promise<string[]>;
}

function redisAuthStore(url: string, token: string): AuthStore {
  const base = url.replace(/\/+$/, '');

  async function command<T>(args: (string | number)[]): Promise<T> {
    let res: Response;
    try {
      res = await fetch(base, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new AuthStoreUnavailableError('The sign-in database could not be reached.');
    }
    if (!res.ok) throw new AuthStoreUnavailableError(`The sign-in database refused the request (HTTP ${res.status}).`);
    return ((await res.json()) as { result: T }).result;
  }

  return {
    kind: 'redis',
    get: (key) => command<string | null>(['GET', key]),
    async set(key, value, opts = {}) {
      const args: (string | number)[] = ['SET', key, value];
      if (opts.ttlSeconds) args.push('EX', Math.max(1, Math.ceil(opts.ttlSeconds)));
      if (opts.onlyIfNew) args.push('NX');
      return (await command<string | null>(args)) === 'OK';
    },
    async del(...keys) {
      if (keys.length > 0) await command(['DEL', ...keys]);
    },
    async increment(key, ttlSeconds) {
      const count = await command<number>(['INCR', key]);
      if (count === 1) await command(['EXPIRE', key, ttlSeconds]);
      return count;
    },
    addToSet: async (key, member) => (await command<number>(['SADD', key, member])) === 1,
    setMembers: (key) => command<string[]>(['SMEMBERS', key]),
    async removeFromSet(key, member) {
      await command(['SREM', key, member]);
    },
    async addToTimeline(key, time, value, keepFrom, maxEntries) {
      await command(['ZADD', key, time, value]);
      await command(['ZREMRANGEBYSCORE', key, '-inf', `(${keepFrom}`]);
      await command(['ZREMRANGEBYRANK', key, 0, -(maxEntries + 1)]);
    },
    readTimeline: (key, from, max) => command<string[]>(['ZRANGE', key, '+inf', from, 'BYSCORE', 'REV', 'LIMIT', 0, max]),
  };
}

function memoryAuthStore(): AuthStore {
  const values = new Map<string, { value: string; expiresAt: number }>();
  const sets = new Map<string, Set<string>>();
  const timelines = new Map<string, { time: number; value: string }[]>();

  const live = (key: string) => {
    const entry = values.get(key);
    if (entry && entry.expiresAt <= Date.now()) {
      values.delete(key);
      return undefined;
    }
    return entry;
  };

  return {
    kind: 'memory',
    async get(key) {
      return live(key)?.value ?? null;
    },
    async set(key, value, opts = {}) {
      if (opts.onlyIfNew && live(key)) return false;
      values.set(key, { value, expiresAt: opts.ttlSeconds ? Date.now() + opts.ttlSeconds * 1000 : Infinity });
      return true;
    },
    async del(...keys) {
      for (const key of keys) {
        values.delete(key);
        sets.delete(key);
        timelines.delete(key);
      }
    },
    async increment(key, ttlSeconds) {
      const entry = live(key);
      const count = (entry ? Number(entry.value) : 0) + 1;
      values.set(key, { value: String(count), expiresAt: entry?.expiresAt ?? Date.now() + ttlSeconds * 1000 });
      return count;
    },
    async addToSet(key, member) {
      const set = sets.get(key) ?? new Set<string>();
      sets.set(key, set);
      if (set.has(member)) return false;
      set.add(member);
      return true;
    },
    async setMembers(key) {
      return [...(sets.get(key) ?? [])];
    },
    async removeFromSet(key, member) {
      sets.get(key)?.delete(member);
    },
    async addToTimeline(key, time, value, keepFrom, maxEntries) {
      const entries = [{ time, value }, ...(timelines.get(key) ?? [])]
        .filter((entry) => entry.time >= keepFrom)
        .sort((a, b) => b.time - a.time)
        .slice(0, maxEntries);
      timelines.set(key, entries);
    },
    async readTimeline(key, from, max) {
      return (timelines.get(key) ?? []).filter((entry) => entry.time >= from).slice(0, max).map((entry) => entry.value);
    },
  };
}

let store: AuthStore | null | undefined;

/** The sign-in store, or null when this server has nowhere safe to keep sign-in state. */
export function getAuthStore(): AuthStore | null {
  if (store !== undefined) return store;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && /^https:\/\//.test(url)) {
    store = redisAuthStore(url, token);
  } else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    store = null;
  } else {
    store = memoryAuthStore();
  }
  return store;
}

export function requireAuthStore(): AuthStore {
  const found = getAuthStore();
  if (!found) throw new AuthStoreUnavailableError();
  return found;
}
