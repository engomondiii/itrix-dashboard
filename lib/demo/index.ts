/**
 * Demo mode — the template running against an in-browser mock backend.
 *
 * Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` and every feature works
 * with no backend at all: sign in with demo@example.com / demo1234, and the
 * products screen exercises search, filters, sorting, pagination, CRUD,
 * trash/restore, bulk actions and CSV export against MSW handlers that speak
 * the Django starter's exact wire contracts (see `handlers.ts`).
 *
 * Everything is loaded dynamically from `Providers`, so a production build
 * with demo mode off ships none of this — msw and the handlers stay out of
 * the bundle entirely.
 *
 * Delete this directory (and its wiring in `components/providers.tsx`) once
 * you have a real backend; nothing else references it.
 */

export async function enableDemoMode(): Promise<void> {
  const { setupWorker } = await import('msw/browser');
  const { handlers } = await import('./handlers');
  const { notificationHandlers } = await import('./notifications');
  const { todayHandlers } = await import('./today');

  await setupWorker(...handlers, ...notificationHandlers, ...todayHandlers).start({
    // Anything the handlers don't model (static assets, HMR, source maps)
    // must pass through untouched — and without console noise.
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });

  console.info(
    '[demo] Mock backend active — sign in with demo@example.com / demo1234. ' +
      'Set NEXT_PUBLIC_DEMO_MODE=false to use a real backend.',
  );
}
