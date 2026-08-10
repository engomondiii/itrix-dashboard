'use client';

/**
 * Every client-side provider, in one component.
 *
 * `app/layout.tsx` stays a Server Component and renders this. That boundary
 * matters: marking the layout itself `'use client'` opts the entire route
 * tree below it out of server rendering, which costs you streaming, server
 * data fetching, and a good deal of bundle size — for the sake of a context
 * provider that only needed to be a leaf.
 *
 * Provider order is not arbitrary. `QueryClientProvider` wraps `AuthProvider`
 * because auth uses the HTTP layer; theme wraps both because it is inert.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { getQueryClient } from '@/lib/api/query-client';
import { AuthProvider } from '@/lib/auth/auth-context';
import { isDemoMode } from '@/lib/env';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

/**
 * Demo-mode gate.
 *
 * When `NEXT_PUBLIC_DEMO_MODE=true`, nothing may render until the MSW worker
 * is intercepting — otherwise the auth bootstrap's refresh request races the
 * worker registration and escapes to the real network. The dynamic import
 * keeps msw and the handlers out of the bundle when the flag is off: the
 * flag is inlined at build time, so the import below is dead code and
 * tree-shaken in a normal build.
 */
function useMocksReady(): boolean {
  const [ready, setReady] = useState(!isDemoMode());

  useEffect(() => {
    if (ready) return;
    import('@/lib/demo')
      .then(({ enableDemoMode }) => enableDemoMode())
      .catch((error) => {
        console.error('[demo] Mock backend failed to start:', error);
      })
      // Render either way — a broken worker should degrade to visible
      // failed requests, not a permanently blank page.
      .then(() => setReady(true));
  }, [ready]);

  return ready;
}

export function Providers({ children }: { children: ReactNode }) {
  const mocksReady = useMocksReady();
  // Not `useState(() => new QueryClient())` and not a module constant.
  // `getQueryClient()` handles both cases correctly: a singleton in the
  // browser so navigation reuses the cache, a fresh instance per SSR request
  // so one user's data is never served to another. See query-client.ts.
  const queryClient = getQueryClient();

  if (!mocksReady) return null;

  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
