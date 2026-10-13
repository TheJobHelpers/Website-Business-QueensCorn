'use server';

import type { Product } from '@/data/products';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { products } from '@/server/repositories';
import { ValidationError, parseId, parseProductInput } from '@/server/validation';

/** Add a flavor (id = null) or change one. */
export async function saveProductAction(id: string | null, input: unknown): Promise<ActionResult<Product>> {
  return adminAction(async () => {
    const data = parseProductInput(input);
    const saved = id === null ? await products.create(data) : await products.update(parseId(id), (previous) => ({ ...data, id: previous.id }));
    publishSiteData();
    return saved;
  }, id === null ? 'Flavor added. It is live in the shop.' : 'Flavor updated.');
}

/** The two switches on the flavor list: on the homepage, and hidden from the site. */
export async function setProductFlagAction(
  id: string,
  flag: 'featured' | 'hidden',
  value: boolean
): Promise<ActionResult<Product>> {
  return adminAction(async () => {
    if (flag !== 'featured' && flag !== 'hidden') throw new ValidationError({ form: 'Unknown setting.' });
    const saved = await products.update(parseId(id), (product) => ({ ...product, [flag]: value === true }));
    publishSiteData();
    return saved;
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await products.remove(parseId(id));
    publishSiteData();
  }, 'Flavor deleted.');
}
