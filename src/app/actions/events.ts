'use server';

import { revalidatePath } from 'next/cache';
import { EventItem } from '@/data/events';
import {
  getDbEvents,
  addDbEvent,
  deleteDbEvent,
  toggleDbEventPickup,
  resetDbEvents,
} from '@/lib/db';

export async function fetchServerEvents(): Promise<EventItem[]> {
  try {
    return await getDbEvents();
  } catch (err) {
    console.error('Failed to fetch events from server DB:', err);
    return [];
  }
}

export async function addServerEvent(event: Omit<EventItem, 'id'>): Promise<EventItem | null> {
  try {
    const res = await addDbEvent(event);
    revalidatePath('/');
    revalidatePath('/events');
    return res;
  } catch (err) {
    console.error('Failed to add event to server DB:', err);
    return null;
  }
}

export async function deleteServerEvent(id: string): Promise<boolean> {
  try {
    const res = await deleteDbEvent(id);
    revalidatePath('/');
    revalidatePath('/events');
    return res;
  } catch (err) {
    console.error('Failed to delete event from server DB:', err);
    return false;
  }
}

export async function toggleServerEventPickup(id: string): Promise<boolean> {
  try {
    const res = await toggleDbEventPickup(id);
    revalidatePath('/');
    revalidatePath('/events');
    return res;
  } catch (err) {
    console.error('Failed to toggle event pickup on server DB:', err);
    return false;
  }
}

export async function resetServerEvents(): Promise<EventItem[]> {
  try {
    const res = await resetDbEvents();
    revalidatePath('/');
    revalidatePath('/events');
    return res;
  } catch (err) {
    console.error('Failed to reset server DB events:', err);
    return [];
  }
}
