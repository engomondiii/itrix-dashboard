'use client';

/**
 * Leads — one destination, two presentations of the same query:
 *
 *   List  — filterable table, priority/stage as CHIPS (the old dashboard had
 *           four tier pages and per-stage pages; they were filters all along)
 *   Board — the same leads grouped by stage, kanban-style, client-side
 *           (the backend has no pipeline endpoint)
 *
 * All view state lives in the URL (?view=board&stage=NDA&p=1&q=…) so a
 * filtered view can be pasted into chat and survives reload.
 */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/entity/format';
import { useLeads } from '@/lib/leads/hooks';
import { BOARD_STAGES, PARKED_STAGES } from '@/lib/leads/api';
import type { LeadRow, LeadStatus } from '@/lib/today/types';

const PRIORITIES = [1, 2, 3, 4] as const;

/** Stage → compact board/chip label (staff language). */
const STAGE_LABEL: Partial<Record<LeadStatus, string>> = {
  'Meeting Booked': 'Meeting',
};

function stageLabel(stage: LeadStatus): string {
  return STAGE_LABEL[stage] ?? stage;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {children}
    </button>
  );
}

function PriorityDot({ tier }: { tier: number }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        tier === 1 && 'bg-tier-1',
        tier === 2 && 'bg-tier-2',
        tier === 3 && 'bg-tier-3',
        tier >= 4 && 'bg-tier-4',
      )}
      aria-hidden
    />
  );
}

function LeadsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get('view') === 'board' ? 'board' : 'list';
  const stage = (searchParams.get('stage') ?? '') as LeadStatus | '';
  const tier = Number(searchParams.get('p')) || null;
  const search = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      // Any filter change resets pagination.
      if (!('page' in patch)) next.delete('page');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // The board needs the whole funnel; the list respects the filters.
  const leads = useLeads(
    view === 'board'
      ? { pageSize: 200, sort: 'tier', dir: 'asc' }
      : { status: stage, tier, search, page, sort: 'submittedAt', dir: 'desc' },
  );
  const rows = leads.data?.results ?? [];

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every lead in one place — filter the list, or see the funnel as a board.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {(['list', 'board'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setParams({ view: v === 'list' ? null : v })}
              aria-pressed={view === v}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize',
                view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {view === 'list' && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setParams({ q: e.target.value || null })}
              placeholder="Search company, name, pain…"
              className="h-8 w-56 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            {PRIORITIES.map((p) => (
              <Chip key={p} active={tier === p} onClick={() => setParams({ p: tier === p ? null : String(p) })}>
                P{p}
              </Chip>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            {[...BOARD_STAGES, ...PARKED_STAGES].map((s) => (
              <Chip key={s} active={stage === s} onClick={() => setParams({ stage: stage === s ? null : s })}>
                {stageLabel(s)}
              </Chip>
            ))}
          </div>

          <LeadTable rows={rows} isLoading={leads.isLoading} />

          {(leads.data?.totalPages ?? 1) > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span data-numeric>
                Page {leads.data?.page} of {leads.data?.totalPages} · {leads.data?.count} leads
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (leads.data?.totalPages ?? 1)}
                  onClick={() => setParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'board' && <LeadBoard rows={rows} isLoading={leads.isLoading} />}
    </section>
  );
}

function LeadTable({ rows, isLoading }: { rows: LeadRow[]; isLoading: boolean }) {
  if (isLoading && rows.length === 0) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (rows.length === 0) {
    return (
      <div className="glass-surface rounded-xl p-10 text-center text-sm text-muted-foreground">
        No leads match these filters.
      </div>
    );
  }
  return (
    <div className="glass-surface overflow-x-auto rounded-xl">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Company / contact</th>
            <th className="px-4 py-2.5 font-medium">Priority</th>
            <th className="px-4 py-2.5 font-medium">Stage</th>
            <th className="px-4 py-2.5 font-medium">Score</th>
            <th className="px-4 py-2.5 font-medium">Owner</th>
            <th className="px-4 py-2.5 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
              <td className="px-4 py-2.5">
                <Link href="/leads" className="font-medium hover:underline">
                  {row.company || row.visitorName || 'Unknown'}
                </Link>
                {row.primaryPain && (
                  <div className="max-w-[28ch] truncate text-xs text-muted-foreground">{row.primaryPain}</div>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-1.5">
                  <PriorityDot tier={row.tier} /> P{row.tier}
                </span>
              </td>
              <td className="px-4 py-2.5">{stageLabel(row.status)}</td>
              <td className="px-4 py-2.5" data-numeric>
                {row.score}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{row.owner ?? '—'}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{formatRelative(row.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadBoard({ rows, isLoading }: { rows: LeadRow[]; isLoading: boolean }) {
  if (isLoading && rows.length === 0) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  const parked = rows.filter((r) => PARKED_STAGES.includes(r.status));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {BOARD_STAGES.map((stage) => {
          const cards = rows.filter((r) => r.status === stage);
          return <BoardColumn key={stage} title={stageLabel(stage)} cards={cards} />;
        })}
        {parked.length > 0 && <BoardColumn title="Parked / closed" cards={parked} muted />}
      </div>
    </div>
  );
}

function BoardColumn({ title, cards, muted = false }: { title: string; cards: LeadRow[]; muted?: boolean }) {
  return (
    <div className={cn('w-56 shrink-0 rounded-xl bg-muted/50 p-2', muted && 'opacity-70')}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground" data-numeric>
          {cards.length}
        </span>
      </div>
      <div className="space-y-2">
        {cards.map((row) => (
          <Link
            key={row.id}
            href="/leads"
            className="glass-surface block rounded-lg p-2.5 text-xs hover:bg-accent/50"
          >
            <div className="flex items-center gap-1.5 font-medium">
              <PriorityDot tier={row.tier} />
              <span className="truncate">{row.company || row.visitorName || 'Unknown'}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>P{row.tier} · {row.score}</span>
              <span>{row.owner ? row.owner.split(/\s+/)[0] : 'unowned'}</span>
            </div>
          </Link>
        ))}
        {cards.length === 0 && <div className="px-1 py-3 text-center text-xs text-muted-foreground">—</div>}
      </div>
    </div>
  );
}

export function LeadsView() {
  return (
    // useSearchParams needs a Suspense boundary to build.
    <Suspense fallback={null}>
      <LeadsInner />
    </Suspense>
  );
}
