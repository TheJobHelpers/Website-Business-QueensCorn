'use server';

import type { FundraiserCampaign } from '@/data/fundraisers';
import type { ActionResult } from '@/lib/action-result';
import { adminAction, publishSiteData } from '@/server/admin-action';
import { fundraisers } from '@/server/repositories';
import { ValidationError, parseFundraiserInput, parseId } from '@/server/validation';

/** Add a campaign (id = null) or change one. Codes are unique: shoppers type them at checkout. */
export async function saveFundraiserAction(
  id: string | null,
  input: unknown
): Promise<ActionResult<FundraiserCampaign>> {
  return adminAction(async () => {
    const data = parseFundraiserInput(input);
    const taken = (await fundraisers.list()).some((f) => f.code === data.code && f.id !== id);
    if (taken) throw new ValidationError({ code: 'Another campaign already uses this code.' });

    const saved =
      id === null ? await fundraisers.create(data) : await fundraisers.update(parseId(id), (previous) => ({ ...data, id: previous.id }));
    publishSiteData();
    return saved;
  }, id === null ? 'Campaign added. It is live on the Fundraising page.' : 'Campaign updated.');
}

export async function deleteFundraiserAction(id: string): Promise<ActionResult> {
  return adminAction(async () => {
    await fundraisers.remove(parseId(id));
    publishSiteData();
  }, 'Campaign deleted.');
}
