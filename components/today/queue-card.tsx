'use client';

/**
 * One item in the Today queue: a glass card with a title line, a meta line,
 * and inline actions on the right (wrapping under on small screens).
 *
 * The card body can be a link (`href`) — actions sit outside the link so a
 * misaimed tap on "Snooze" never navigates.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface QueueCardProps {
  title: ReactNode;
  /** Small print under the title: who/when/why it's here. */
  meta?: ReactNode;
  /** Where clicking the body goes; omit for non-navigating cards. */
  href?: string;
  /** Inline action buttons; keep to 2–3. */
  actions?: ReactNode;
  /** Left accent stripe. */
  tone?: 'urgent' | 'warn' | 'neutral';
  className?: string;
}

const TONE_STRIPE: Record<NonNullable<QueueCardProps['tone']>, string> = {
  urgent: 'border-l-destructive',
  warn: 'border-l-warning',
  neutral: 'border-l-brand-accent',
};

export function QueueCard({ title, meta, href, actions, tone = 'neutral', className }: QueueCardProps) {
  const body = (
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium">{title}</div>
      {meta && <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div>}
    </div>
  );

  return (
    <div
      className={cn(
        'glass-surface flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border-l-2 px-4 py-3',
        TONE_STRIPE[tone],
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </Link>
      ) : (
        body
      )}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
