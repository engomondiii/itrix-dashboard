'use client';

/**
 * Conversations — tabbed and grouped by WHO, because one visitor produces
 * many threads (every client-page visit can open one) and a flat list turns
 * into 70 look-alike rows.
 *
 *   Tabs      Needs attention (live or visitor-engaged) · Quiet · All
 *   Grouping  by company (lead/client identity); anonymous visitors last.
 *             A company header collapses a person's many sessions into one
 *             readable block. Not every thread has a lead — anonymous and
 *             portal sessions link up only at qualification.
 *
 * The server honours no filters (only limit) — tabs, search and grouping
 * are all client-side over the newest 500.
 */

import Link from 'next/link';
import { useState } from 'react';

import { formatRelative } from '@/lib/entity/format';
import { useThreadBoard } from '@/lib/today/hooks';
import type { ThreadRow } from '@/lib/today/types';
import { cn } from '@/lib/utils';
import { journeyLabel } from '@/lib/leads/journey-labels';
import { ShowMore, useCapped } from '@/components/today/use-capped';

const HOUR_MS = 60 * 60 * 1000;

type Activity = 'active' | 'waiting' | 'quiet';

function activityOf(row: ThreadRow): Activity {
  const last = new Date(row.lastActivityAt ?? row.createdAt).getTime();
  const age = Date.now() - last;
  if (age < HOUR_MS) return 'active';
  if (row.visitorTurns > 0 && age < 24 * HOUR_MS) return 'waiting';
  return 'quiet';
}

type TabKey = 'attention' | 'quiet' | 'all';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'attention', label: 'Needs attention' },
  { key: 'quiet', label: 'Quiet' },
  { key: 'all', label: 'All' },
];

function inTab(tab: TabKey, activity: Activity): boolean {
  if (tab === 'all') return true;
  if (tab === 'attention') return activity !== 'quiet';
  return activity === 'quiet';
}

function lastTouch(row: ThreadRow): string {
  return row.lastActivityAt ?? row.createdAt;
}

function Row({ row }: { row: ThreadRow }) {
  const activity = activityOf(row);
  return (
    <Link
      href={`/conversations/${row.threadId}`}
      className={cn(
        'glass-surface flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border-l-2 px-4 py-3 text-sm hover:bg-accent/40',
        activity === 'active'
          ? 'border-l-brand-accent'
          : activity === 'waiting'
            ? 'border-l-warning'
            : 'border-l-transparent',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{row.title || 'Untitled conversation'}</span>
        <span className="block text-xs text-muted-foreground">
          {row.turnCount} turns ({row.visitorTurns} from the visitor) · {journeyLabel(row.journeyState)}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(lastTouch(row))}</span>
    </Link>
  );
}

function IdentityGroup({ title, meta, rows }: { title: string; meta?: string; rows: ThreadRow[] }) {
  const sorted = [...rows].sort((a, b) => lastTouch(b).localeCompare(lastTouch(a)));
  const { visible, remaining, showMore } = useCapped(sorted);
  return (
    <div className="mb-5">
      <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
        {title}{' '}
        <span className="font-sans text-xs font-normal text-muted-foreground">
          — {rows.length} conversation{rows.length === 1 ? '' : 's'}
          {meta ? ` · ${meta}` : ''}
        </span>
      </h2>
      <div className="space-y-2">
        {visible.map((row) => (
          <Row key={row.threadId} row={row} />
        ))}
        <ShowMore remaining={remaining} onClick={showMore} />
      </div>
    </div>
  );
}

export function ConversationsView() {
  const board = useThreadBoard();
  const [tab, setTab] = useState<TabKey>('attention');
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const all = board.data?.results ?? [];
  const searched = all.filter(
    (r) => !needle || r.title.toLowerCase().includes(needle) || r.company.toLowerCase().includes(needle),
  );
  const counts: Record<TabKey, number> = {
    attention: searched.filter((r) => inTab('attention', activityOf(r))).length,
    quiet: searched.filter((r) => inTab('quiet', activityOf(r))).length,
    all: searched.length,
  };
  const rows = searched.filter((r) => inTab(tab, activityOf(r)));

  // Group by identity: named companies first (most recent first), then the
  // anonymous pool. One person's many sessions collapse into one block.
  const byCompany = new Map<string, ThreadRow[]>();
  for (const row of rows) {
    const key = row.company || '';
    byCompany.set(key, [...(byCompany.get(key) ?? []), row]);
  }
  const named = [...byCompany.entries()]
    .filter(([company]) => company !== '')
    .sort((a, b) => {
      const lastA = a[1].map(lastTouch).sort().at(-1) ?? '';
      const lastB = b[1].map(lastTouch).sort().at(-1) ?? '';
      return lastB.localeCompare(lastA);
    });
  const anonymous = byCompany.get('') ?? [];

  return (
    <section>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">Conversations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch the AI talk to visitors, live — open a transcript to read and reply.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or company…"
          className="h-8 w-56 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </header>

      <div className="mb-5 flex rounded-lg border border-border p-0.5" role="tablist">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium',
              tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {label}{' '}
            <span className={cn('tabular-nums', tab === key ? 'opacity-80' : 'text-muted-foreground')} data-numeric>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {board.isLoading && all.length === 0 ? (
        <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="glass-surface rounded-xl p-10 text-center text-sm text-muted-foreground">
          {needle ? 'Nothing matches the search here.' : 'Nothing in this tab right now.'}
        </div>
      ) : (
        <>
          {named.map(([company, companyRows]) => (
            <IdentityGroup
              key={company}
              title={company}
              meta={companyRows[0].leadId ? undefined : 'no lead linked yet'}
              rows={companyRows}
            />
          ))}
          {anonymous.length > 0 && (
            <IdentityGroup
              title="Anonymous visitors"
              meta="identity unknown until they qualify"
              rows={anonymous}
            />
          )}
        </>
      )}

      {all.length >= 500 && (
        <p className="text-xs text-muted-foreground">
          Showing the newest 500 conversations — the backend has no paging beyond that yet.
        </p>
      )}
    </section>
  );
}
