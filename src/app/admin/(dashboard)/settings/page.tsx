import MySignIn from '@/components/admin/MySignIn';
import SettingsPanel from '@/components/admin/SettingsPanel';
import { backupCodesLeft } from '@/server/auth/accounts';
import { getAdminConfig } from '@/server/auth/config';
import { currentAccount, getAccounts, requireAdminPage } from '@/server/auth/guard';
import { dataKeyProblem } from '@/server/auth/sealed';
import { SESSION_IDLE_SECONDS, SESSION_MAX_SECONDS } from '@/server/auth/session';
import { isShopifyAdminConnected } from '@/server/shopify-admin';
import { getStore } from '@/server/store';

export default async function AdminSettingsPage() {
  const session = await requireAdminPage();
  const config = getAdminConfig();
  const account = await currentAccount();
  const keyProblem = dataKeyProblem();

  let backupCodes = { total: 0, left: 0 };
  let accountCount = 0;
  try {
    accountCount = ((await getAccounts()) ?? []).length;
    if (account) backupCodes = { total: account.backupCodeHashes.length, left: await backupCodesLeft(account) };
  } catch (err) {
    console.error('Could not count the accounts or backup codes:', err);
  }

  // Only facts and display text are passed to the browser: never a secret, token or hash.
  return (
    <SettingsPanel
      status={{
        email: session.email,
        role: session.role,
        storeKind: getStore().kind,
        accountCount,
        idleMinutes: SESSION_IDLE_SECONDS / 60,
        maxHours: SESSION_MAX_SECONDS / 3600,
        backupCodes,
        settingsToTidy: [...config.problems, ...(keyProblem ? [keyProblem] : [])],
        shopifyConfigured: Boolean(
          process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
        ),
        shopifyAdminConnected: isShopifyAdminConnected(),
      }}
      mySignIn={<MySignIn unavailable={keyProblem ? 'Changing your sign-in here needs ADMIN_DATA_KEY in the server settings.' : null} />}
    />
  );
}
