'use client';

/**
 * Every timestamp in the console, in one component.
 *
 * Relative text stays the default — "3 hours ago" is the right answer to
 * "how stale is this", which is what a work queue is actually asking. What
 * changes is that the exact instant is now always one hover away, on the
 * operating clock, with the zone named (see lib/time/zones.ts for why that
 * matters on a two-site team).
 *
 * It renders a real `<time>` element, so the machine-readable instant is in
 * the DOM whether or not anyone hovers.
 *
 * Only the RELATIVE text is localized ("3 hours ago" / "3시간 전"). The
 * absolute instant and the hover title stay on the operating clock in en-GB,
 * 24-hour — deliberately, and not an oversight: `lib/time/zones.ts` explains
 * why one unambiguous rendering of a time is worth more to a two-site team
 * than a locally idiomatic one. A handover note that says "15:04 KST" means
 * the same thing in Seoul and in Nairobi, in either language.
 */

import { formatRelative } from '@/lib/entity/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { describeInstant, formatInstant, type InstantOptions } from '@/lib/time/zones';
import { cn } from '@/lib/utils';

export interface StampProps extends Pick<InstantOptions, 'site' | 'withYear'> {
  /** ISO string from the wire. */
  at: string | null | undefined;
  /** Show the absolute instant inline instead of relative text. */
  absolute?: boolean;
  /** Rendered when `at` is missing. */
  fallback?: string;
  className?: string;
}

export function Stamp({ at, absolute = false, fallback = '—', site, withYear, className }: StampProps) {
  const { locale } = useLocale();

  if (!at) return <>{fallback}</>;

  const text = absolute ? formatInstant(at, { site, withYear }) : formatRelative(at, locale);
  if (!text) return <>{fallback}</>;

  return (
    <time dateTime={at} title={describeInstant(at)} className={cn(className)}>
      {text}
    </time>
  );
}
