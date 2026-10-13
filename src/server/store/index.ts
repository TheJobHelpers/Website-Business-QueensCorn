import 'server-only';
import fs from 'fs/promises';
import path from 'path';

// Where owner-edited data (events, flavors, fundraisers) is kept. One small interface, three
// implementations, chosen from the environment:
//
//   redis     production: an Upstash Redis database (Vercel > Storage). Set
//             KV_REST_API_URL + KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair).
//   file      local development: JSON files in .data/ (git-ignored).
//   readonly  Vercel without a database: the site shows the built-in seed data, and saving
//             fails with a clear message instead of pretending to work (Vercel's file system
//             cannot keep files between requests).

export type StoreKind = 'redis' | 'file' | 'readonly';

export interface DataStore {
  kind: StoreKind;
  /** null when nothing has been saved under this key yet */
  read(key: string): Promise<unknown | null>;
  write(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Cache tag on everything read from the store; admin actions expire it after a save. */
export const SITE_DATA_TAG = 'site-data';

export class StoreUnavailableError extends Error {
  constructor(message = 'Saving is not set up on this server yet. Connect a database in Settings.') {
    super(message);
    this.name = 'StoreUnavailableError';
  }
}

// ---------------- Upstash Redis over REST (no client library needed) ----------------
function redisStore(url: string, token: string): DataStore {
  const base = url.replace(/\/+$/, '');
  const headers = { Authorization: `Bearer ${token}` };

  async function command(args: unknown[]): Promise<unknown> {
    const res = await fetch(base, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new StoreUnavailableError(`The database refused the request (HTTP ${res.status}).`);
    return ((await res.json()) as { result?: unknown }).result;
  }

  return {
    kind: 'redis',
    async read(key) {
      // A cached GET: public pages stay static, and saving expires SITE_DATA_TAG.
      const res = await fetch(`${base}/get/${encodeURIComponent(key)}`, {
        headers,
        next: { tags: [SITE_DATA_TAG] },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new StoreUnavailableError(`The database could not be read (HTTP ${res.status}).`);
      const { result } = (await res.json()) as { result?: string | null };
      return typeof result === 'string' ? JSON.parse(result) : null;
    },
    async write(key, value) {
      await command(['SET', key, JSON.stringify(value)]);
    },
    async remove(key) {
      await command(['DEL', key]);
    },
  };
}

// ---------------- JSON files in .data/ (local development) ----------------
function fileStore(dir: string): DataStore {
  const fileFor = (key: string) => path.join(dir, `${key.replace(/[^a-z0-9_-]/gi, '_')}.json`);
  // one write at a time, so two quick saves cannot interleave
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  };

  return {
    kind: 'file',
    async read(key) {
      try {
        return JSON.parse(await fs.readFile(fileFor(key), 'utf8'));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw err;
      }
    },
    write(key, value) {
      return enqueue(async () => {
        await fs.mkdir(dir, { recursive: true });
        const file = fileFor(key);
        // write beside it, then swap: a crash mid-write never leaves a half-written file
        const temp = `${file}.${process.pid}.tmp`;
        await fs.writeFile(temp, JSON.stringify(value, null, 2), 'utf8');
        await fs.rename(temp, file);
      });
    },
    remove(key) {
      return enqueue(async () => {
        await fs.rm(fileFor(key), { force: true });
      });
    },
  };
}

// ---------------- Nothing to save to ----------------
const readonlyStore: DataStore = {
  kind: 'readonly',
  async read() {
    return null;
  },
  async write() {
    throw new StoreUnavailableError();
  },
  async remove() {
    throw new StoreUnavailableError();
  },
};

let store: DataStore | undefined;

export function getStore(): DataStore {
  if (store) return store;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && /^https:\/\//.test(url)) {
    store = redisStore(url, token);
  } else if (process.env.VERCEL) {
    store = readonlyStore;
  } else {
    store = fileStore(path.join(process.cwd(), '.data'));
  }
  return store;
}
