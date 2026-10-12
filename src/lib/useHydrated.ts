import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during prerender and the first client render, true afterwards.
 * Use it for anything that depends on "now" (e.g. hiding past events), so a page
 * prerendered at build time doesn't mismatch what the visitor's browser renders.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
