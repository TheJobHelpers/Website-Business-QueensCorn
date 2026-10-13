// What every admin server action returns. Shared by the server (which builds it) and the
// dashboard components (which show it).
export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | {
      ok: false;
      error: string;
      /** one message per form field, keyed by field name */
      fieldErrors?: Record<string, string>;
      code?: 'unauthorized' | 'store';
    };
