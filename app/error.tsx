'use client';

/**
 * Route-segment error boundary.
 *
 * Next.js renders this in place of any route that throws during render —
 * without it, a production crash is a blank screen. `reset()` re-renders the
 * failed segment, which genuinely recovers from transient causes (a race, a
 * flaky fetch resolved by retry); it is not a page reload.
 *
 * Deliberately no error details in the UI: a stack trace is meaningless to
 * users and can leak internals. The digest is shown because it is what
 * support can correlate against server logs, and nothing more.
 */

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/i18n/locale-provider';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = useCopy();

  useEffect(() => {
    // Replace with your error-reporting call (Sentry etc.). Console is the
    // template default so the error is at least never swallowed silently.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{copy.errors.somethingWentWrong}</h1>
      <p className="text-sm text-muted-foreground">
        {copy.errors.unexpectedError}
        {error.digest ? (
          <>
            {' '}
            ({copy.errors.reference} <code className="font-mono">{error.digest}</code>)
          </>
        ) : null}
        .
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>{copy.common.tryAgain}</Button>
        <Button asChild variant="outline">
          <Link href="/">{copy.common.goHome}</Link>
        </Button>
      </div>
    </main>
  );
}
