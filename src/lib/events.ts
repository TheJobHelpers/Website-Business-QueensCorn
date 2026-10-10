import type { EventItem } from '@/data/events';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Last day of an event at 23:59, from its month / day ("17-18" or "17–18") / year strings.
 * Returns null when the date can't be read, so the event is kept rather than hidden.
 */
export function eventEndDate(event: EventItem): Date | null {
  const month = MONTHS.indexOf(event.month.trim().slice(0, 3).toLowerCase());
  const days = event.day.split(/[-–]/).map((d) => parseInt(d, 10)).filter((d) => !Number.isNaN(d));
  const year = parseInt(event.year, 10);
  if (month < 0 || days.length === 0 || Number.isNaN(year)) return null;
  return new Date(year, month, days[days.length - 1], 23, 59, 59);
}

/** Events that haven't finished yet, soonest first. */
export function getUpcomingEvents(events: EventItem[], now: Date = new Date()): EventItem[] {
  return events
    .map((event) => ({ event, end: eventEndDate(event) }))
    .filter(({ end }) => end === null || end >= now)
    .sort((a, b) => (a.end?.getTime() ?? Infinity) - (b.end?.getTime() ?? Infinity))
    .map(({ event }) => event);
}

/** Same label format the cart uses for pickup (see CartContext selectedPickupEvent). */
export function pickupLabel(event: EventItem): string {
  return `${event.title} (${event.month} ${event.day})`;
}

/** Short weekday for the ticket stub, e.g. "Sat" or "Sat–Sun". */
export function weekdayLabel(event: EventItem): string {
  const month = MONTHS.indexOf(event.month.trim().slice(0, 3).toLowerCase());
  const year = parseInt(event.year, 10);
  const days = event.day.split(/[-–]/).map((d) => parseInt(d, 10)).filter((d) => !Number.isNaN(d));
  if (month < 0 || Number.isNaN(year) || days.length === 0) return '';
  const fmt = (d: number) => new Date(year, month, d).toLocaleDateString('en-US', { weekday: 'short' });
  return days.length > 1 ? `${fmt(days[0])}–${fmt(days[days.length - 1])}` : fmt(days[0]);
}
