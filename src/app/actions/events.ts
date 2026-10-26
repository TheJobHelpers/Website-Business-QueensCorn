'use server';

import type { EventItem } from '@/data/events';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { events } from '@/server/repositories';
import { parseEventInput, parseId } from '@/server/validation';

/** Add an event (id = null) or change one. */
export async function saveEventAction(id: string | null, input: unknown): Promise<ActionResult<EventItem>> {
  return adminAction(async () => {
    const data = parseEventInput(input);
    const saved = id === null ? await events.create(data) : await events.update(parseId(id), (previous) => ({ ...data, id: previous.id }));
    publishSiteData();
    return saved;
  }, id === null ? 'Event added. It is live on the site.' : 'Event updated.', (saved) => `${id === null ? 'Added' : 'Changed'} event "${saved.title}"`);
}

export async function setEventPickupAction(id: string, pickupAvailable: boolean): Promise<ActionResult<EventItem>> {
  return adminAction(async () => {
    const saved = await events.update(parseId(id), (event) => ({ ...event, pickupAvailable: pickupAvailable === true }));
    publishSiteData();
    return saved;
  }, pickupAvailable ? 'Pre-order pickup is on for this event.' : 'Pre-order pickup is off for this event.', (saved) =>
    `Turned pre-order pickup ${pickupAvailable ? 'on' : 'off'} for "${saved.title}"`);
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  let title = '';
  return adminAction(async () => {
    const eventId = parseId(id);
    title = (await events.list()).find((e) => e.id === eventId)?.title ?? eventId;
    await events.remove(eventId);
    publishSiteData();
  }, 'Event deleted.', () => `Deleted event "${title}"`);
}
