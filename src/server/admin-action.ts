import 'server-only';
import { revalidatePath, updateTag } from 'next/cache';
import { UnauthorizedError, requireAdmin } from './auth/guard';
import { SITE_DATA_TAG, StoreUnavailableError } from './store';
import { ValidationError } from './validation';
import type { ActionResult } from '@/lib/action-result';

// Every admin server action goes through adminAction(): it checks the session FIRST, runs the
// work, and turns any failure into a message that is safe to show. A server action is a public
// HTTP endpoint, whatever page it is imported into, so the check cannot live in the UI.

export async function adminAction<T>(work: () => Promise<T>, successMessage?: string): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    const data = await work();
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
