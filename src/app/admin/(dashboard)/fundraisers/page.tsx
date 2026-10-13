import FundraisersManager from '@/components/admin/FundraisersManager';
import { requireAdminPage } from '@/server/auth/guard';
import { fundraisers } from '@/server/repositories';

export default async function AdminFundraisersPage() {
  await requireAdminPage();
  return <FundraisersManager fundraisers={await fundraisers.list()} />;
}
