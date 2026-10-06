import fs from 'fs/promises';
import path from 'path';
import { UPCOMING_EVENTS, EventItem } from '@/data/events';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DatabaseSchema {
  events: EventItem[];
  updatedAt: string;
}

/**
 * Initializes and reads the server database file.
 */
async function readDatabase(): Promise<DatabaseSchema> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema;
    if (Array.isArray(data.events) && data.events.length > 0) {
      return data;
    }
  } catch {
    // If file doesn't exist, initialize with default fixtures
  }

  const initialData: DatabaseSchema = {
    events: UPCOMING_EVENTS,
    updatedAt: new Date().toISOString(),
  };

  try {
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch {
    // Readonly environment fallback
  }

  return initialData;
}

/**
 * Writes updated data to the server database file.
 */
async function writeDatabase(data: DatabaseSchema): Promise<void> {
  data.updatedAt = new Date().toISOString();
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to database file:', err);
  }
}

/**
 * Retrieves all events from the server database.
 */
export async function getDbEvents(): Promise<EventItem[]> {
  const db = await readDatabase();
  return db.events;
}

/**
 * Adds an event to the server database.
 */
export async function addDbEvent(event: Omit<EventItem, 'id'>): Promise<EventItem> {
  const db = await readDatabase();
  const newEvent: EventItem = {
    ...event,
    id: `evt-${Date.now()}`,
  };

  db.events = [newEvent, ...db.events];
  await writeDatabase(db);
  return newEvent;
}

/**
 * Deletes an event by ID from the server database.
 */
export async function deleteDbEvent(id: string): Promise<boolean> {
  const db = await readDatabase();
  const initialLength = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  await writeDatabase(db);
  return db.events.length < initialLength;
}

/**
 * Toggles pickup availability for an event in the server database.
 */
export async function toggleDbEventPickup(id: string): Promise<boolean> {
  const db = await readDatabase();
  let found = false;
  db.events = db.events.map((e) => {
    if (e.id === id) {
      found = true;
      return { ...e, pickupAvailable: !e.pickupAvailable };
    }
    return e;
  });

  if (found) {
    await writeDatabase(db);
  }
  return found;
}

/**
 * Resets events in the server database back to defaults.
 */
export async function resetDbEvents(): Promise<EventItem[]> {
  const resetData: DatabaseSchema = {
    events: UPCOMING_EVENTS,
    updatedAt: new Date().toISOString(),
  };
  await writeDatabase(resetData);
  return resetData.events;
}
