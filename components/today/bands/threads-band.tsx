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
import type { ThreadRow } from '@/lib/today/types';
import { QueueCard } from '../queue-card';
import { TodayBand } from '../today-band';
import { ShowMore, useCapped } from '../use-capped';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

function probablyWaiting(row: ThreadRow): boolean {
  if (row.visitorTurns === 0) return false;
  const last = row.lastActivityAt ?? row.createdAt;
  return Date.now() - new Date(last).getTime() < ACTIVE_WINDOW_MS;
}

export function ThreadsBand({ forceOpen = false }: { forceOpen?: boolean }) {
  const copy = useCopy();
  const board = useThreadBoard();
  const rows = (board.data?.results ?? []).filter(probablyWaiting);
  const { visible, remaining, showMore } = useCapped(rows);

  return (
    <TodayBand
      forceOpen={forceOpen}
      title={copy.today.threadsTitle}
      storageKey="threads"
      hint={copy.today.threadsHint}
      count={rows.length}
      isLoading={board.isLoading}
      tone="warn"
    >
      {visible.map((row) => (
        <QueueCard
          key={row.threadId}
          tone="warn"
          href="/conversations"
          title={
            <>
              {row.title || copy.today.untitledConversation}
              {row.company ? <span className="text-muted-foreground"> · {row.company}</span> : null}
              {row.anonymous ? <span className="text-muted-foreground"> · anonymous</span> : null}
            </>
          }
          meta={
            <>
              {copy.today.visitorTurns(row.visitorTurns)} · {copy.today.lastActivity}{' '}
              <Stamp at={row.lastActivityAt ?? row.createdAt} />
            </>
          }
        />
      ))}
      <ShowMore remaining={remaining} onClick={showMore} />
    </TodayBand>
  );
}
