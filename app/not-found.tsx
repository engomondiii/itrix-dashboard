/**
 * 404 — a Server Component, static, no client JS.
 *
 * Rendered for unmatched routes and by `notFound()` calls. Kept deliberately
 * plain: a lost visitor needs a way back, not a mascot.
 */

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The address may be mistyped, or the page may have moved.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
