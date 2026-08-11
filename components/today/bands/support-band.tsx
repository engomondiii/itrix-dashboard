'use client';

/**
 * Band 7 — open support requests. READ-ONLY by backend design: there are no
 * assign/resolve/escalate endpoints, so the card never fakes a button. It's
 * a heads-up that routes to the customer.
 */

import { useAuth } from '@/lib/auth/auth-context';
import { useSupportQueue } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import type { SupportRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { inScope, type TodayScope } from '../scope';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';

function tone(row: SupportRow): 'urgent' | 'warn' | 'neutral' {
  if (row.blocking || row.slaBreaching || row.urgency === 'critical') return 'urgent';
  if (row.urgency === 'high') return 'warn';
  return 'neutral';
}

export function SupportBand({ ownerScope, forceOpen = false }: { ownerScope: TodayScope; forceOpen?: boolean }) {
  const { user } = useAuth();
  const queue = useSupportQueue();
  const rows = (queue.data?.results ?? []).filter((row) =>
    inScope(ownerScope, row.owner, user?.name),
  );
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title="Open support requests"
      hint="handled outside this screen for now — read-only heads-up"
      count={rows.length}
      isLoading={queue.isLoading}
      tone="warn"
    >
      {visible.map((row) => (
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
      <ShowMore remaining={remaining} onClick={showMore} />
    </TodayBand>
  );
}
