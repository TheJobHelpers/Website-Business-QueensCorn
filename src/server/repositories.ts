import 'server-only';
import crypto from 'crypto';
import { UPCOMING_EVENTS, type EventItem } from '@/data/events';
import { ACTIVE_FUNDRAISERS, type FundraiserCampaign } from '@/data/fundraisers';
import { ALL_PRODUCTS, PRODUCT_IMAGES, type Product } from '@/data/products';
import { getStore } from './store';
import { ValidationError, isAllowedProductImage } from './validation';

// Reading and changing the three owner-edited collections. Each one starts as the built-in list
// in src/data and is replaced by the saved copy the first time the owners change something.
// Callers pass already-validated input (see validation.ts); the admin check happens in the
// server actions, before anything here is called.

const MAX_ITEMS = 200;

const LEGACY_PRODUCT_IMAGES: Record<string, string> = {
  'Sweet & Salty': '/flavor-regular-real.png',
  Caramel: '/flavor-caramel-real.png',
  'Caramel Apple': '/flavor-mix-real.png',
  'Caramel Cheddar': '/flavor-caramel-cheddar.png',
  Cheddar: '/flavor-cheddar-real.png',
  'Cheddar with Smoked Jalapeño': '/flavor-jalapeno-real.png',
  'Cinnamon Apple': '/flavor-mix-real.png',
  'Patriot (Red-White-Blue)': '/flavor-patriot-real.png',
  'Nacho Cheddar': '/flavor-cheddar-real.png',
  'BBQ Cheddar': '/flavor-cheddar-real.png',
};

interface Collection<T extends { id: string }> {
  list(): Promise<T[]>;
  create(input: Omit<T, 'id'>): Promise<T>;
  update(id: string, change: (item: T) => T): Promise<T>;
  remove(id: string): Promise<void>;
  replaceAll(items: T[]): Promise<void>;
  /** back to the built-in list */
  reset(): Promise<void>;
}

function collection<T extends { id: string }>(opts: {
  key: string;
  idPrefix: string;
  seed: T[];
  /** true if a saved record still has the shape we expect */
  isValid: (item: unknown) => item is T;
}): Collection<T> {
  const notFound = () => new ValidationError({ id: 'That item no longer exists. Refresh the page.' });

  async function list(): Promise<T[]> {
    const saved = await getStore().read(opts.key);
    // anything that is not a list of well-formed records is ignored rather than rendered
    if (!Array.isArray(saved)) return opts.seed;
    return saved.filter(opts.isValid);
  }

  async function save(items: T[]): Promise<void> {
    if (items.length > MAX_ITEMS) {
      throw new ValidationError({ form: `There is room for ${MAX_ITEMS} items. Delete some first.` });
    }
    await getStore().write(opts.key, items);
  }

  return {
    list,
    async create(input) {
      const items = await list();
      const item = { ...input, id: `${opts.idPrefix}-${crypto.randomUUID().slice(0, 8)}` } as T;
      await save([...items, item]);
      return item;
    },
    async update(id, change) {
      const items = await list();
      const index = items.findIndex((i) => i.id === id);
      if (index < 0) throw notFound();
      const updated = { ...change(items[index]), id };
      await save(items.map((i, n) => (n === index ? updated : i)));
      return updated;
    },
    async remove(id) {
      const items = await list();
      if (!items.some((i) => i.id === id)) throw notFound();
      await save(items.filter((i) => i.id !== id));
    },
    replaceAll: save,
    async reset() {
      await getStore().remove(opts.key);
    },
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown): v is string => typeof v === 'string';

export const events = collection<EventItem>({
  key: 'qc_events',
  idPrefix: 'evt',
  seed: UPCOMING_EVENTS,
  isValid: (v): v is EventItem =>
    isRecord(v) && str(v.id) && str(v.title) && str(v.month) && str(v.day) && str(v.year) && str(v.time) && str(v.location) && str(v.desc),
});

export const products = collection<Product>({
  key: 'qc_products',
  idPrefix: 'p',
  seed: ALL_PRODUCTS,
  isValid: (v): v is Product =>
    isRecord(v) && str(v.id) && str(v.name) && str(v.price) && str(v.description) && str(v.category) && str(v.image) && isAllowedProductImage(v.image),
});

export const fundraisers = collection<FundraiserCampaign>({
  key: 'qc_fundraisers',
  idPrefix: 'fund',
  seed: ACTIVE_FUNDRAISERS,
  isValid: (v): v is FundraiserCampaign =>
    isRecord(v) && str(v.id) && str(v.organization) && str(v.code) && typeof v.goalAmount === 'number' && typeof v.raisedAmount === 'number',
});

/** If the database is unreachable the public site falls back to the built-in list: it never goes down. */
async function listOrSeed<T extends { id: string }>(source: Collection<T>, seed: T[], name: string): Promise<T[]> {
  try {
    return await source.list();
  } catch (err) {
    console.error(`Could not load ${name} from the store; showing the built-in list.`, err);
    return seed;
  }
}

/** What the public site needs: hidden flavors are left out. */
export async function getSiteData() {
  const [allProducts, allEvents, allFundraisers] = await Promise.all([
    listOrSeed(products, ALL_PRODUCTS, 'flavors'),
    listOrSeed(events, UPCOMING_EVENTS, 'events'),
    listOrSeed(fundraisers, ACTIVE_FUNDRAISERS, 'fundraisers'),
  ]);
  return {
    products: allProducts
      .filter((p) => !p.hidden)
      .map((product) => {
        const legacyImage = LEGACY_PRODUCT_IMAGES[product.name];
        const updatedImage = PRODUCT_IMAGES[product.name];
        return legacyImage && updatedImage && product.image === legacyImage
          ? { ...product, image: updatedImage }
          : product;
      }),
    events: allEvents,
    fundraisers: allFundraisers,
  };
}
