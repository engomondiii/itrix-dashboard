'use client';

/**
 * Conversations — tabbed and grouped by WHO, because one visitor produces
 * many threads (every client-page visit can open one) and a flat list turns
 * into 70 look-alike rows.
 *
 *   Tabs      Cumulative age windows — Ongoing · 24 hrs · 3 days · 1 week
 *             · 1 month · All. Each includes everything newer, so a thread
 *             never vanishes from view simply by ageing past the tab you
 *             are on, and the counts read as a decay curve left to right.
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

import { useThreadBoard } from '@/lib/today/hooks';
import type { ThreadRow } from '@/lib/today/types';
import { cn } from '@/lib/utils';
import { ShowMore, useCapped } from '@/components/today/use-capped';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * A visitor-engaged thread stops counting as waiting on us after three days
 * of silence. This is the same boundary as the "3 days" tab on purpose: the
 * row accent stops nagging exactly where the tab says the thread went quiet.
 */
const SILENT_AFTER_MS = 72 * HOUR_MS;

type Activity = 'active' | 'waiting' | 'quiet';

function ageOf(row: ThreadRow): number {
  return Date.now() - new Date(row.lastActivityAt ?? row.createdAt).getTime();
}

function activityOf(row: ThreadRow): Activity {
  const age = ageOf(row);
  if (age < HOUR_MS) return 'active';
  if (row.visitorTurns > 0 && age < SILENT_AFTER_MS) return 'waiting';
  return 'quiet';
}

type TabKey = 'ongoing' | 'h24' | 'd3' | 'w1' | 'm1' | 'all';

type TabLabelKey = 'tabOngoing' | 'tab24h' | 'tab3d' | 'tab1w' | 'tab1m' | 'tabAll';

/**
 * Cumulative, not exclusive: `maxAgeMs` is a ceiling, so every tab contains
 * the ones to its left. Ordered newest-first, which is also how the counts
 * are meant to be read. `all` has no ceiling.
 *
 * Keys index `copy.conversations`, resolved at render.
 */
const TABS: Array<{ key: TabKey; labelKey: TabLabelKey; maxAgeMs: number }> = [
  { key: 'ongoing', labelKey: 'tabOngoing', maxAgeMs: HOUR_MS },
  { key: 'h24', labelKey: 'tab24h', maxAgeMs: DAY_MS },
  { key: 'd3', labelKey: 'tab3d', maxAgeMs: SILENT_AFTER_MS },
  { key: 'w1', labelKey: 'tab1w', maxAgeMs: 7 * DAY_MS },
  { key: 'm1', labelKey: 'tab1m', maxAgeMs: 30 * DAY_MS },
  { key: 'all', labelKey: 'tabAll', maxAgeMs: Number.POSITIVE_INFINITY },
];

const MAX_AGE_BY_TAB = new Map<TabKey, number>(TABS.map((t) => [t.key, t.maxAgeMs]));

function inTab(tab: TabKey, age: number): boolean {
  return age < (MAX_AGE_BY_TAB.get(tab) ?? Number.POSITIVE_INFINITY);
}

function lastTouch(row: ThreadRow): string {
  return row.lastActivityAt ?? row.createdAt;
}

function Row({ row }: { row: ThreadRow }) {
  const copy = useCopy();
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
        <span className="block truncate font-medium">{row.title || copy.conversations.untitled}</span>
        <span className="block text-xs text-muted-foreground">
          {copy.conversations.turnSummary(row.turnCount, row.visitorTurns)} ·{' '}
          {copy.status.relationshipLabel(row.relationshipState ?? '')} ·{' '}
          {copy.status.mirrorLabel(row.mirrorStatus ?? '')}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground"><Stamp at={lastTouch(row)} /></span>
    </Link>
  );
}

function IdentityGroup({ title, meta, rows }: { title: string; meta?: string; rows: ThreadRow[] }) {
  const copy = useCopy();
  const sorted = [...rows].sort((a, b) => lastTouch(b).localeCompare(lastTouch(a)));
  const { visible, remaining, showMore } = useCapped(sorted);
  return (
    <div className="mb-5">
      <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
        {title}{' '}
        <span className="font-sans text-xs font-normal text-muted-foreground">
          — {copy.conversations.conversationCount(rows.length)}
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
  const copy = useCopy();
  const board = useThreadBoard();
  const [tab, setTab] = useState<TabKey>('h24');
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const all = board.data?.results ?? [];
  const searched = all.filter(
    (r) => !needle || r.title.toLowerCase().includes(needle) || r.company.toLowerCase().includes(needle),
  );
  // One age per row, reused by every tab count and by the filter below.
  const aged = searched.map((row) => ({ row, age: ageOf(row) }));
  const counts = Object.fromEntries(
    TABS.map(({ key }) => [key, aged.filter(({ age }) => inTab(key, age)).length]),
  ) as Record<TabKey, number>;
  const rows = aged.filter(({ age }) => inTab(tab, age)).map(({ row }) => row);

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
          <h1 className="font-display tracking-display text-2xl font-semibold">
            {copy.conversations.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.conversations.subtitle}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={copy.conversations.searchPlaceholder}
          className="h-8 w-56 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </header>

      <div className="mb-5 flex flex-wrap rounded-lg border border-border p-0.5" role="tablist">
        {TABS.map(({ key, labelKey }) => (
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
            {copy.conversations[labelKey]}{' '}
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
          {needle ? copy.conversations.noMatch : copy.conversations.emptyTab}
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
              title={copy.conversations.anonymousVisitors}
              meta={copy.conversations.identityUnknown}
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
