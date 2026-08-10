'use client';

/**
 * Conversations — the live board. One list of AI conversations grouped by
 * urgency (client-side; the server only honours `limit`):
 *
 *   Active now      activity in the last hour
 *   Waiting on us   visitor engaged, activity in the last 24h
 *   Quiet           everything else
 *
 * A row opens its transcript. The board is cockpit THREADS; the message
 * plane (console conversations) is a different model — the transcript view
 * offers "reply as a person" where a leadId links the two.
 */

import Link from 'next/link';

import { formatRelative } from '@/lib/entity/format';
import { useThreadBoard } from '@/lib/today/hooks';
import type { ThreadRow } from '@/lib/today/types';
import { cn } from '@/lib/utils';
import { journeyLabel } from '@/lib/leads/journey-labels';

const HOUR_MS = 60 * 60 * 1000;

function groupOf(row: ThreadRow): 'active' | 'waiting' | 'quiet' {
  const last = new Date(row.lastActivityAt ?? row.createdAt).getTime();
  const age = Date.now() - last;
  if (age < HOUR_MS) return 'active';
  if (row.visitorTurns > 0 && age < 24 * HOUR_MS) return 'waiting';
  return 'quiet';
}

const GROUPS: Array<{ key: 'active' | 'waiting' | 'quiet'; title: string; hint: string }> = [
  { key: 'active', title: 'Active now', hint: 'activity in the last hour' },
  { key: 'waiting', title: 'Waiting on us', hint: 'visitor engaged in the last 24h' },
  { key: 'quiet', title: 'Quiet', hint: 'no recent activity' },
];

export function ConversationsView() {
  const board = useThreadBoard();
  const rows = board.data?.results ?? [];

  return (
    <section>
      <header className="mb-5">
        <h1 className="font-display tracking-display text-2xl font-semibold">Conversations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Watch the AI talk to visitors, live — open a transcript to see every turn.
        </p>
      </header>

      {board.isLoading && rows.length === 0 ? (
        <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="glass-surface rounded-xl p-10 text-center text-sm text-muted-foreground">
          No conversations yet.
        </div>
      ) : (
        GROUPS.map(({ key, title, hint }) => {
          const group = rows.filter((r) => groupOf(r) === key);
          if (group.length === 0) return null;
          return (
            <div key={key} className="mb-6">
              <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
                {title}{' '}
                <span className="font-sans text-xs font-normal text-muted-foreground">
                  — {hint} · {group.length}
                </span>
              </h2>
              <div className="space-y-2">
                {group.map((row) => (
                  <Link
                    key={row.threadId}
                    href={`/conversations/${row.threadId}`}
                    className={cn(
                      'glass-surface flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border-l-2 px-4 py-3 text-sm hover:bg-accent/40',
                      key === 'active' ? 'border-l-brand-accent' : key === 'waiting' ? 'border-l-warning' : 'border-l-transparent',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {row.title || 'Untitled conversation'}
                        {row.company && <span className="text-muted-foreground"> · {row.company}</span>}
                        {row.anonymous && <span className="text-muted-foreground"> · anonymous</span>}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {row.turnCount} turns ({row.visitorTurns} from the visitor) · {journeyLabel(row.journeyState)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(row.lastActivityAt ?? row.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
