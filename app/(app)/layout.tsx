'use client';

/**
 * Shared chrome + auth guard for every screen in the `(app)` group.
 *
 * The guard lives here, not in each page: a page that forgets to wrap itself
 * in `ProtectedRoute` is exactly the kind of silent hole a route group
 * closes structurally. Pages under `(app)` render content only.
 */

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
