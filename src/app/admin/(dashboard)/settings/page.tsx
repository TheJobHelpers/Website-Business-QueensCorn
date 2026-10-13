import SettingsPanel from '@/components/admin/SettingsPanel';
import { getAdminConfig } from '@/server/auth/config';
import { requireAdminPage } from '@/server/auth/guard';
import { SESSION_TTL_SECONDS } from '@/server/auth/session';
import { isShopifyAdminConnected } from '@/server/shopify-admin';
import { getStore } from '@/server/store';

export default async function AdminSettingsPage() {
  const session = await requireAdminPage();
  const config = getAdminConfig();

  // Only yes/no facts are passed to the browser: never a secret, token or address.
  return (
    <SettingsPanel
      status={{
        email: session.email,
        storeKind: getStore().kind,
        passwordIsHashed: config.ok && config.config.password.kind === 'scrypt',
        shopifyConfigured: Boolean(
          process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
        ),
        shopifyAdminConnected: isShopifyAdminConnected(),
        sessionDays: Math.round(SESSION_TTL_SECONDS / 86400),
      }}
    />
  );
}
