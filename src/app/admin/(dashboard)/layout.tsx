import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdminPage } from '@/server/auth/guard';

export const metadata: Metadata = {
  title: "Owner dashboard | The Queen's Corn",
  robots: { index: false, follow: false },
};

// Everything under /admin except the sign-in page. The session is checked here on the server
// for every request (src/proxy.ts only redirects; it is not the lock on the door).
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
