import 'server-only';
import type { EventItem } from '@/data/events';
import type { FundraiserCampaign } from '@/data/fundraisers';
import type { Product } from '@/data/products';

// Everything the admin sends is untrusted until it has been through here. Each `parse…`
// function takes `unknown`, collects one message per bad field, and returns a clean object
// with exactly the fields we store (anything extra is dropped).

export class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super('Some fields need attention.');
    this.name = 'ValidationError';
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CATEGORIES: Product['category'][] = ['Sweet', 'Savory', 'Spicy', 'Seasonal'];

// control characters (other than newline and tab) have no business in a title or description
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

class Checker {
  errors: Record<string, string> = {};
  private data: Record<string, unknown>;

  constructor(input: unknown) {
    this.data = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  }

  private fail(field: string, message: string) {
    if (!this.errors[field]) this.errors[field] = message;
  }

  text(field: string, label: string, opts: { min?: number; max: number; multiline?: boolean }): string {
    const raw = this.data[field];
    let value = typeof raw === 'string' ? raw.replace(CONTROL_CHARS, '').trim() : '';
    if (!opts.multiline) value = value.replace(/\s+/g, ' ');
    const min = opts.min ?? 1;
    if (value.length < min) {
      this.fail(field, min <= 1 ? `${label} is required.` : `${label} needs at least ${min} characters.`);
    } else if (value.length > opts.max) {
      this.fail(field, `${label} can be at most ${opts.max} characters.`);
    }
    return value;
  }

  optionalText(field: string, label: string, max: number): string {
    return this.text(field, label, { min: 0, max });
  }

  number(field: string, label: string, opts: { min: number; max: number; integer?: boolean }): number {
    const raw = this.data[field];
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(value)) {
      this.fail(field, `${label} must be a number.`);
      return opts.min;
    }
    if (opts.integer && !Number.isInteger(value)) this.fail(field, `${label} must be a whole number.`);
    if (value < opts.min || value > opts.max) this.fail(field, `${label} must be between ${opts.min} and ${opts.max}.`);
    return value;
  }

  boolean(field: string): boolean {
    return this.data[field] === true;
  }

  oneOf<T extends string>(field: string, label: string, options: readonly T[]): T {
    const raw = this.data[field];
    if (typeof raw === 'string' && (options as readonly string[]).includes(raw)) return raw as T;
    this.fail(field, `Choose a ${label.toLowerCase()}.`);
    return options[0];
  }

  /** "2026-10-17" → a real calendar date, or null */
  date(field: string, label: string, required = true): { year: number; month: number; day: number } | null {
    const raw = this.data[field];
    if (typeof raw !== 'string' || raw === '') {
      if (required) this.fail(field, `${label} is required.`);
      return null;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (match) {
      const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
      const date = new Date(Date.UTC(year, month - 1, day));
      const real = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
      if (real && year >= 2020 && year <= 2100) return { year, month, day };
    }
    this.fail(field, `${label} is not a valid date.`);
    return null;
  }

  error(field: string, message: string) {
    this.fail(field, message);
  }

  done() {
    if (Object.keys(this.errors).length > 0) throw new ValidationError(this.errors);
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

// ---------------- Events ----------------
export function parseEventInput(input: unknown): Omit<EventItem, 'id'> {
  const c = new Checker(input);
  const title = c.text('title', 'Event name', { min: 2, max: 100 });
  const location = c.text('location', 'Location', { min: 2, max: 140 });
  const time = c.text('time', 'Hours', { min: 2, max: 60 });
  const desc = c.optionalText('desc', 'Description', 400);
  const start = c.date('startDate', 'Start date');
  const end = c.date('endDate', 'End date', false);
  const pickupAvailable = c.boolean('pickupAvailable');

  let day = '';
  if (start) {
    day = pad(start.day);
    if (end) {
      if (end.year !== start.year || end.month !== start.month) {
        c.error('endDate', 'An event must start and end in the same month. Add a second event for the rest.');
      } else if (end.day < start.day) {
        c.error('endDate', 'The end date is before the start date.');
      } else if (end.day > start.day) {
        day = `${pad(start.day)}-${pad(end.day)}`;
      }
    }
  }
  c.done();

  return {
    title,
    desc,
    time,
    location,
    month: MONTHS[start!.month - 1],
    day,
    year: String(start!.year),
    pickupAvailable,
  };
}

// ---------------- Products ----------------
// A photo is either a file in /public or an image on Shopify's CDN: nothing else gets rendered.
const LOCAL_IMAGE = /^\/[a-z0-9][a-z0-9._-]{0,80}\.(png|jpe?g|webp)$/i;
const SHOPIFY_IMAGE = /^https:\/\/cdn\.shopify\.com\/[a-z0-9/_.\-?=&%]{1,300}$/i;

export function isAllowedProductImage(value: string): boolean {
  return LOCAL_IMAGE.test(value) || SHOPIFY_IMAGE.test(value);
}

export function parseProductInput(input: unknown): Omit<Product, 'id'> {
  const c = new Checker(input);
  const name = c.text('name', 'Flavor name', { min: 2, max: 60 });
  const description = c.text('description', 'Description', { min: 5, max: 300 });
  const category = c.oneOf('category', 'Taste', CATEGORIES);
  const price = c.number('price', 'Small bag price', { min: 0.5, max: 500 });
  const image = c.text('image', 'Photo', { max: 400 });
  if (image && !isAllowedProductImage(image)) c.error('image', 'Choose one of the listed photos.');
  const tasteLabel = c.optionalText('tasteLabel', 'Taste meter label', 20);
  const tasteLevel = c.number('tasteLevel', 'Taste meter level', { min: 0, max: 5, integer: true });
  const featured = c.boolean('featured');
  const hidden = c.boolean('hidden');
  c.done();

  return {
    name,
    description,
    category,
    price: `$${(Math.round(price * 100) / 100).toFixed(2)}`,
    image,
    ...(tasteLabel && tasteLevel > 0 ? { taste: { label: tasteLabel, level: tasteLevel } } : {}),
    featured,
    hidden,
  };
}

// ---------------- Fundraisers ----------------
export function parseFundraiserInput(input: unknown): Omit<FundraiserCampaign, 'id'> {
  const c = new Checker(input);
  const organization = c.text('organization', 'Group name', { min: 2, max: 100 });
  const category = c.text('category', 'Kind of group', { min: 2, max: 60 });
  const location = c.text('location', 'Town', { min: 2, max: 80 });
  const description = c.optionalText('description', 'Description', 300);
  const code = c.text('code', 'Code', { min: 3, max: 20 }).toUpperCase();
  if (code && !/^[A-Z0-9]+$/.test(code)) c.error('code', 'Use letters and numbers only, no spaces.');
  const goalAmount = c.number('goalAmount', 'Goal', { min: 1, max: 1_000_000 });
  const raisedAmount = c.number('raisedAmount', 'Raised so far', { min: 0, max: 1_000_000 });
  const end = c.date('endDate', 'End date');
  c.done();

  return {
    organization,
    category,
    location,
    description,
    code,
    goalAmount: Math.round(goalAmount * 100) / 100,
    raisedAmount: Math.round(raisedAmount * 100) / 100,
    endDate: `${MONTHS[end!.month - 1]} ${pad(end!.day)}, ${end!.year}`,
  };
}

/** Ids come back from the browser too: only our own id shapes are accepted. */
export function parseId(value: unknown): string {
  if (typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) return value;
  throw new ValidationError({ id: 'That item no longer exists. Refresh the page.' });
}
