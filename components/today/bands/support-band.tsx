'use client';

/**
 * Band 7 — open support requests. READ-ONLY by backend design: there are no
 * assign/resolve/escalate endpoints, so the card never fakes a button. It's
 * a heads-up that routes to the customer.
 */

import { useSupportQueue } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import type { SupportRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { TodayBand } from '../today-band';

function tone(row: SupportRow): 'urgent' | 'warn' | 'neutral' {
  if (row.blocking || row.slaBreaching || row.urgency === 'critical') return 'urgent';
  if (row.urgency === 'high') return 'warn';
  return 'neutral';
}

export function SupportBand() {
  const queue = useSupportQueue();
  const rows = queue.data?.results ?? [];

  return (
    <TodayBand
      title="Open support requests"
      hint="handled outside this screen for now — read-only heads-up"
      count={rows.length}
      isLoading={queue.isLoading}
      tone="warn"
    >
      {rows.map((row) => (
        <QueueCard
          key={row.requestId}
          tone={tone(row)}
          href="/customers"
          title={
            <>
              {row.subject}
              <span className="text-muted-foreground"> · {row.company}</span>
            </>
          }
          meta={
            <>
              {row.blocking ? 'BLOCKING · ' : ''}
              {row.urgency}
              {row.slaBreaching ? ' · past its response window' : ''}
              {' · '}
              {row.owner || 'unowned'} · opened {formatRelative(row.createdAt)}
            </>
          }
        />
      ))}
    </TodayBand>
  );
}
