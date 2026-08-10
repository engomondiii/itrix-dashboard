/**
 * KPI stat cards — the header row of a dashboard or list page.
 *
 * Harvested as a pattern from the source project's `_shared/StatCard`, which
 * out-adopted its 21,892-line sibling (see lib/entity/ANALYSIS.md): small
 * presentational pieces, no data fetching inside. The page owns the query and
 * passes values down — a stat card that fetches its own data can't share a
 * cache key with the table it summarises, and the two drift.
 *
 * `value` accepts a ReactNode so pages can pass formatted output from
 * lib/entity/format.ts (currency, compact numbers) without this component
 * growing a formatting API of its own.
 */

import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small print under the value — a delta, a period, a hint. */
  detail?: ReactNode;
  /** Loading skeleton instead of a value. */
  isLoading?: boolean;
}

export function StatCard({ label, value, detail, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" aria-hidden="true" />
      ) : (
        <p className="mt-1 text-2xl font-semibold" data-numeric>
          {value}
        </p>
      )}
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

/** Responsive wrapper: 2-up on phones, up to `columns` on desktop. */
export function StatGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
}) {
  // Static class strings so the Tailwind scanner sees every variant.
  const cols = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  }[columns];

  return <div className={`grid grid-cols-2 gap-3 ${cols}`}>{children}</div>;
}
