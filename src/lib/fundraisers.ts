import type { FundraiserCampaign } from '@/data/fundraisers';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * A campaign's last day at 23:59, from its "Nov 30, 2026"-style end date (same clock as
 * eventEndDate in ./events). Returns null when the date can't be read, so the campaign is kept.
 */
export function fundraiserEndDate(campaign: FundraiserCampaign): Date | null {
  const match = /^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})$/i.exec(campaign.endDate.trim());
  const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1;
  if (!match || month < 0) return null;
  return new Date(Number(match[3]), month, Number(match[2]), 23, 59, 59);
}

/** Campaigns that haven't ended yet: the only ones a shopper can pick or check out with. */
export function getOpenFundraisers(campaigns: FundraiserCampaign[], now: Date = new Date()): FundraiserCampaign[] {
  return campaigns.filter((campaign) => {
    const end = fundraiserEndDate(campaign);
    return end === null || end >= now;
  });
}
