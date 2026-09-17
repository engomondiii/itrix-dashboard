/**
 * 404 — a Server Component, static, no client JS.
 *
 * Rendered for unmatched routes and by `notFound()` calls. Kept deliberately
 * plain: a lost visitor needs a way back, not a mascot.
 */

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getCopy } from '@/lib/i18n/server';

export default async function NotFound() {
  // Reading the locale cookie server-side keeps this page what its docstring
  // says it is: translated, and still zero client JavaScript.
  const copy = await getCopy();

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">{copy.errors.notFoundTitle}</h1>
      <p className="text-sm text-muted-foreground">{copy.errors.notFoundBody}</p>
      <Button asChild>
        <Link href="/">{copy.common.goHome}</Link>
      </Button>
    </main>
  );
}
