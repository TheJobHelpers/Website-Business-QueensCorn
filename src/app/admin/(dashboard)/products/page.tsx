import ProductsManager from '@/components/admin/ProductsManager';
import { requireAdminPage } from '@/server/auth/guard';
import { products } from '@/server/repositories';

export default async function AdminProductsPage() {
  await requireAdminPage();
  return <ProductsManager products={await products.list()} />;
}
