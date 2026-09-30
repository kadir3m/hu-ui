import { DOCUMENT, DestroyRef, Signal, inject, signal } from '@angular/core';

/**
 * Bir media query'yi signal olarak döndürür. Injection context içinde çağrılmalıdır.
 * @example readonly isMobile = huMediaQuery('(max-width: 1023.98px)');
 */
export function huMediaQuery(query: string): Signal<boolean> {
  const win = inject(DOCUMENT).defaultView;
  const mql = win?.matchMedia?.(query);
  const matches = signal(mql?.matches ?? false);

  if (mql) {
    const listener = (e: MediaQueryListEvent) => matches.set(e.matches);
    mql.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', listener));
  }
  return matches.asReadonly();
}
