import 'server-only';
import { revalidatePath, updateTag } from 'next/cache';
import { recordActivity, requester } from './auth/audit';
import { UnauthorizedError, requireAdmin } from './auth/guard';
import { SITE_DATA_TAG, StoreUnavailableError } from './store';
import { ValidationError } from './validation';
import type { ActionResult } from '@/lib/action-result';

// Every admin server action goes through adminAction(): it checks the session FIRST, runs the
// work, and turns any failure into a message that is safe to show. A server action is a public
// HTTP endpoint, whatever page it is imported into, so the check cannot live in the UI.
// A change that succeeds goes in the activity log with who made it: `activity` says what was
// done (it defaults to the success message; actions that only read leave both out).

export async function adminAction<T>(
  work: () => Promise<T>,
  successMessage?: string,
  activity?: string | ((data: T) => string)
): Promise<ActionResult<T>> {
  try {
    const session = await requireAdmin();
    const data = await work();
    const detail = typeof activity === 'function' ? activity(data) : (activity ?? successMessage);
    if (detail) await recordActivity({ kind: 'change', who: session.email, detail, ...(await requester()) });
    return { ok: true, data, message: successMessage };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { ok: false, error: 'Your session has ended. Sign in again.', code: 'unauthorized' };
    }
    if (err instanceof ValidationError) {
      return { ok: false, error: err.fieldErrors.form ?? err.fieldErrors.id ?? err.message, fieldErrors: err.fieldErrors };
    }
    if (err instanceof StoreUnavailableError) {
      return { ok: false, error: err.message, code: 'store' };
    }
    // details stay in the server log, not in the browser
    console.error('Admin action failed:', err);
    return { ok: false, error: 'Something went wrong on our side. Nothing was saved.' };
  }
}

/** After a change: the public pages and the dashboard pick up the new data straight away. */
export function publishSiteData(): void {
  updateTag(SITE_DATA_TAG);
  revalidatePath('/', 'layout');
}
