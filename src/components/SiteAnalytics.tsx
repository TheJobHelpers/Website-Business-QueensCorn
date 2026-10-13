'use client';

import { Analytics } from '@vercel/analytics/next';

// Visitor numbers for the public pages (Vercel Web Analytics: no cookies, shown in the Vercel
// dashboard). The owner dashboard is left out, so the owners' own clicks are not counted.
export default function SiteAnalytics() {
  return <Analytics beforeSend={(event) => (new URL(event.url).pathname.startsWith('/admin') ? null : event)} />;
}
