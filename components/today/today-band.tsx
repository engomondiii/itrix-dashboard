'use client';

/**
 * One priority band of the Today queue: a header with a count, collapsible,
 * children are the band's cards.
 *
 * Bands render nothing at all when empty and not loading — an empty band is
 * noise, and "you're done" is said once by the page, not seven times by seven
 * headers. The exception is `alwaysShow` (the approvals band uses it: an
 * empty approvals band is genuinely reassuring).
 */

import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useStoredState } from './use-stored';

interface TodayBandProps {
  title: string;
  /** One short sentence under the title, staff language. */
  hint?: string;
  count: number;
  isLoading?: boolean;
  /** Render the header even at zero items. */
  alwaysShow?: boolean;
  /** Accent for the count pill; defaults to neutral. */
  tone?: 'urgent' | 'warn' | 'neutral';
  /** When the queue is focused on this band, it must be open and visible. */
  forceOpen?: boolean;
  children: ReactNode;
}

const TONE_PILL: Record<NonNullable<TodayBandProps['tone']>, string> = {
  urgent: 'bg-destructive/10 text-destructive',
  warn: 'bg-warning-soft text-warning',
  neutral: 'bg-secondary text-secondary-foreground',
};

export function TodayBand({
  title,
  hint,
  count,
  isLoading = false,
  alwaysShow = false,
  tone = 'neutral',
  forceOpen = false,
  children,
}: TodayBandProps) {
  // Collapse choice persists per band — someone who folds "Due today" away
  // shouldn't have to re-fold it on every visit.
  const [stored, setStored] = useStoredState(`today.band.${title}`, 'open');
  const open = forceOpen || stored !== 'closed';
  const toggle = () => setStored(open ? 'closed' : 'open');

  if (!forceOpen && !alwaysShow && !isLoading && count === 0) return null;

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')}
        />
        <h2 className="font-display tracking-display text-sm font-semibold">{title}</h2>
        <span
          className={cn(
            'ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
            TONE_PILL[tone],
          )}
          data-numeric
        >
          {isLoading ? '…' : count}
        </span>
        {hint && <span className="hidden truncate text-xs text-muted-foreground sm:inline">— {hint}</span>}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {isLoading && count === 0 ? (
            <div className="glass-surface animate-pulse rounded-xl px-4 py-6 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </section>
  );
}
