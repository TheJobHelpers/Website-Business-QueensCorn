'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ActionResult } from '@/lib/action-result';

export interface Notice {
  kind: 'ok' | 'error';
  text: string;
}

/**
 * Runs an admin server action and takes care of what every screen needs afterwards:
 * a "saving" state, a message, a refresh of the page data, and a trip back to the
 * sign-in page if the session has ended.
 */
export function useAdminAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<Notice | null>(null);

  // success messages clear themselves; errors stay until dismissed
  useEffect(() => {
    if (notice?.kind !== 'ok') return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const run = useCallback(
    <T,>(
      action: () => Promise<ActionResult<T>>,
      handlers: { onSuccess?: (data: T) => void; onError?: (fieldErrors: Record<string, string>) => void } = {}
    ) => {
      startTransition(async () => {
        let result: ActionResult<T>;
        try {
          result = await action();
        } catch {
          setNotice({ kind: 'error', text: 'Could not reach the server. Check your connection and try again.' });
          return;
        }

        if (result.ok) {
          if (result.message) setNotice({ kind: 'ok', text: result.message });
          handlers.onSuccess?.(result.data);
          router.refresh();
          return;
        }
        if (result.code === 'unauthorized') {
          router.push('/admin/login');
          return;
        }
        setNotice({ kind: 'error', text: result.error });
        handlers.onError?.(result.fieldErrors ?? {});
      });
    },
    [router]
  );

  return { pending, notice, clearNotice: () => setNotice(null), run };
}
