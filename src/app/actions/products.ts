'use server';

import type { Product } from '@/data/products';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { products } from '@/server/repositories';
import { archiveFlavorInShopify, isShopifyAdminConnected, pushFlavorToShopify } from '@/server/shopify-admin';
import { ValidationError, parseId, parseProductInput } from '@/server/validation';

// When the dashboard can write to Shopify, every flavor change goes to Shopify FIRST and is only
// saved on the website if Shopify accepted it: the two never drift apart because of a failed save.

const notFound = () => new ValidationError({ id: 'That item no longer exists. Refresh the page.' });

async function existing(id: string): Promise<Product> {
  const found = (await products.list()).find((p) => p.id === id);
  if (!found) throw notFound();
  return found;
}

/** Add a flavor (id = null) or change one. */
export async function saveProductAction(id: string | null, input: unknown): Promise<ActionResult<Product>> {
  const linked = isShopifyAdminConnected();
  return adminAction(async () => {
    const data = parseProductInput(input);
    const previous = id === null ? null : await existing(parseId(id));
    const kept = { ...(previous?.shopifyId ? { shopifyId: previous.shopifyId } : {}), ...(previous?.shopifyImage ? { shopifyImage: previous.shopifyImage } : {}) };
    const flavor = { ...data, ...(linked ? await pushFlavorToShopify({ ...data, ...kept }) : kept) };

    const saved = previous === null ? await products.create(flavor) : await products.update(previous.id, () => ({ ...flavor, id: previous.id }));
    publishSiteData();
    return saved;
  }, `${id === null ? 'Flavor added. It is live in the shop' : 'Flavor updated'}${linked ? ' and in Shopify' : ''}.`, (saved) =>
    `${id === null ? 'Added' : 'Changed'} flavor "${saved.name}" (Small ${saved.price})${linked ? ', also in Shopify' : ''}`);
}

/** The two switches on the flavor list: on the homepage, and hidden from the site. */
export async function setProductFlagAction(
  id: string,
  flag: 'featured' | 'hidden',
  value: boolean
): Promise<ActionResult<Product>> {
  return adminAction(async () => {
    if (flag !== 'featured' && flag !== 'hidden') throw new ValidationError({ form: 'Unknown setting.' });
    const changed = { ...(await existing(parseId(id))), [flag]: value === true };
    // "on the homepage" is a website matter; "hidden" also takes the flavor off sale in Shopify
    const link = flag === 'hidden' && isShopifyAdminConnected() ? await pushFlavorToShopify(changed) : {};

    const saved = await products.update(changed.id, (product) => ({ ...product, [flag]: value === true, ...link }));
    publishSiteData();
    return saved;
  }, undefined, (saved) =>
    flag === 'hidden'
      ? `${value ? 'Hid' : 'Showed'} flavor "${saved.name}" ${value ? 'from' : 'on'} the website`
      : `${value ? 'Put' : 'Took'} flavor "${saved.name}" ${value ? 'on' : 'off'} the homepage`);
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const linked = isShopifyAdminConnected();
  let name = '';
  return adminAction(async () => {
    const flavor = await existing(parseId(id));
    name = flavor.name;
    if (linked) await archiveFlavorInShopify(flavor);
    await products.remove(flavor.id);
    publishSiteData();
  }, linked ? 'Flavor deleted, and archived in Shopify.' : 'Flavor deleted.', () => `Deleted flavor "${name}"${linked ? ', archived in Shopify' : ''}`);
}
