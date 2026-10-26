import 'server-only';
import { isActive, type AdminAccount, type AdminRole } from './directory';
import { isPhoneSetUp } from './enrollment';
import { inviteExpiresAt } from './invites';
import { getAuthStore } from './kv';
import { backupUsedKey } from './second-step';
import { countSessions } from './sessions';

// What the dashboard may show about each admin. Facts only: never a hash, secret or code.

export interface AccountSummary {
  id: string;
  email: string;
  role: AdminRole;
  /** super admins live in the server settings and cannot be changed from the dashboard */
  source: 'env' | 'db';
  status: 'active' | 'invited';
  addedBy?: string;
  addedAt?: string;
  backupCodesTotal: number;
  backupCodesLeft: number;
  /** devices signed in right now */
  devices: number;
  /** the authenticator app has been added */
  phoneSetUp: boolean;
  /** when their invite link stops working (invited only) */
  inviteExpiresAt: string | null;
}

export async function backupCodesLeft(account: AdminAccount): Promise<number> {
  const used = new Set((await getAuthStore()?.setMembers(backupUsedKey(account.id))) ?? []);
  return account.backupCodeHashes.filter((hash) => !used.has(hash)).length;
}

export async function summarizeAccount(account: AdminAccount): Promise<AccountSummary> {
  const active = isActive(account);
  return {
    id: account.id,
    email: account.email,
    role: account.role,
    source: account.source,
    status: active ? 'active' : 'invited',
    addedBy: account.addedBy,
    addedAt: account.addedAt,
    backupCodesTotal: account.backupCodeHashes.length,
    backupCodesLeft: await backupCodesLeft(account),
    devices: active ? await countSessions(account.email) : 0,
    phoneSetUp: active ? await isPhoneSetUp(account) : false,
    inviteExpiresAt: active ? null : await inviteExpiresAt(account.id),
  };
}
