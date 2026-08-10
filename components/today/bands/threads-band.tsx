'use client';

/**
 * Band 3 — conversations probably waiting on us.
 *
 * The board row has no "last sender" or "needs human" flag, so this is an
 * honest client-side heuristic, labeled as such: the visitor has engaged
 * (`visitorTurns > 0`) and the thread was active in the last 24 hours. The
 * server ignores every board filter except `limit` — filtering is ours.
 */

import { useThreadBoard } from '@/lib/today/hooks';
import { formatRelative } from '@/lib/entity/format';
import type { ThreadRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { TodayBand } from '../today-band';

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

function probablyWaiting(row: ThreadRow): boolean {
  if (row.visitorTurns === 0) return false;
  const last = row.lastActivityAt ?? row.createdAt;
  return Date.now() - new Date(last).getTime() < ACTIVE_WINDOW_MS;
}

export function ThreadsBand() {
  const board = useThreadBoard();
  const rows = (board.data?.results ?? []).filter(probablyWaiting);

  return (
    <TodayBand
      title="Conversations probably waiting"
      hint="visitor engaged in the last 24h — worth a look"
      count={rows.length}
      isLoading={board.isLoading}
      tone="warn"
    >
      {rows.map((row) => (
        <QueueCard
          key={row.threadId}
          tone="warn"
          href="/conversations"
          title={
            <>
              {row.title || 'Untitled conversation'}
              {row.company ? <span className="text-muted-foreground"> · {row.company}</span> : null}
              {row.anonymous ? <span className="text-muted-foreground"> · anonymous</span> : null}
            </>
          }
          meta={
            <>
              {row.visitorTurns} visitor {row.visitorTurns === 1 ? 'turn' : 'turns'} · last activity{' '}
              {formatRelative(row.lastActivityAt ?? row.createdAt)}
            </>
          }
        />
      ))}
    </TodayBand>
  );
}
