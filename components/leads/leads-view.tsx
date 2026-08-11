'use client';

/**
 * Leads — one destination, two presentations of the same query:
 *
 *   List  — filterable table, priority/stage as CHIPS (the old dashboard had
 *           four tier pages and per-stage pages; they were filters all along)
 *   Board — the real pipeline endpoint (GET /api/v1/pipeline/): all 8
 *           visible stages with per-card overdue flags; parked statuses
 *           (Qualifying/Nurture/Negotiation/Lost) exist only as list filters
 *
 * All view state lives in the URL (?view=board&stage=NDA&p=1&q=…) so a
 * filtered view can be pasted into chat and survives reload.
 */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/entity/format';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useLeads, usePipeline } from '@/lib/leads/hooks';
import { PARKED_STAGES } from '@/lib/leads/api';
import type { LeadRow, LeadStatus } from '@/lib/today/types';
import type { PipelineStage } from '@/lib/leads/types';

/** Server-side sortable fields (LeadFilter's sort= vocabulary). */
type SortField = 'submittedAt' | 'score' | 'tier' | 'status';
type SortDir = 'asc' | 'desc';

/** Stage chips shown on the list view (board columns come from the server). */
const LIST_STAGES: LeadStatus[] = [
  'New', 'Contacted', 'Meeting Booked', 'NDA', 'Evaluation', 'PoC',
  'Negotiation', 'Licensed',
];

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
  const urlSearch = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page')) || 1;
  const sort = (searchParams.get('sort') as SortField) || 'submittedAt';
  const dir: SortDir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';

  // The input is instant; the URL (and therefore the server query) follows
  // the debounced value — one request per pause, not per keystroke.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput);

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

  useEffect(() => {
    if (debouncedSearch !== urlSearch) setParams({ q: debouncedSearch || null });
  }, [debouncedSearch, urlSearch, setParams]);

  const setSort = useCallback(
    (field: SortField) => {
      // Same column toggles direction; a new column starts at its natural end.
      if (sort === field) setParams({ dir: dir === 'desc' ? 'asc' : 'desc' });
      else setParams({ sort: field, dir: field === 'tier' ? 'asc' : 'desc' });
    },
    [sort, dir, setParams],
  );

  // List = filtered query; board = the real pipeline endpoint.
  const leads = useLeads({ status: stage, tier, search: urlSearch, page, sort, dir });
  const pipeline = usePipeline(view === 'board');
  const rows = leads.data?.results ?? [];

  return (
    <section>
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
            {[...LIST_STAGES, ...PARKED_STAGES].map((s) => (
              <Chip key={s} active={stage === s} onClick={() => setParams({ stage: stage === s ? null : s })}>
                {stageLabel(s)}
              </Chip>
            ))}
          </div>

          <LeadTable rows={rows} isLoading={leads.isLoading} sort={sort} dir={dir} onSort={setSort} />

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

      {view === 'board' && (
        <LeadBoard stages={pipeline.data?.stages ?? []} isLoading={pipeline.isLoading} />
      )}
    </section>
  );
}

function SortableTh({
  label,
  field,
  sort,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  sort: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const active = sort === field;
  const Arrow = dir === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th
      className="px-4 py-2.5 font-medium"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          'inline-flex items-center gap-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active && 'text-foreground',
        )}
      >
        {label}
        {active && <Arrow className="h-3 w-3" />}
      </button>
    </th>
  );
}

function LeadTable({
  rows,
  isLoading,
  sort,
  dir,
  onSort,
}: {
  rows: LeadRow[];
  isLoading: boolean;
  sort: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
}) {
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
            <SortableTh label="Priority" field="tier" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Stage" field="status" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Score" field="score" sort={sort} dir={dir} onSort={onSort} />
            <th className="px-4 py-2.5 font-medium">Owner</th>
            <SortableTh label="Submitted" field="submittedAt" sort={sort} dir={dir} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
              <td className="px-4 py-2.5">
                <Link href={`/leads/${row.id}`} className="font-medium hover:underline">
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

function LeadBoard({ stages, isLoading }: { stages: PipelineStage[]; isLoading: boolean }) {
  if (isLoading && stages.length === 0) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {stages.map((stage) => (
          <div key={stage.status} className="w-56 shrink-0 rounded-xl bg-muted/50 p-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold">{stageLabel(stage.status)}</span>
              <span className="text-xs text-muted-foreground" data-numeric>
                {stage.count}
              </span>
            </div>
            <div className="space-y-2">
              {stage.leads.map((row) => (
                <Link
                  key={row.id}
                  href={`/leads/${row.id}`}
                  className="glass-surface block rounded-lg p-2.5 text-xs hover:bg-accent/50"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <PriorityDot tier={row.tier} />
                    <span className="truncate">{row.company || row.visitorName || 'Unknown'}</span>
                    {row.overdue && (
                      <span className="ml-auto rounded-full bg-destructive-soft px-1.5 text-[10px] font-semibold text-destructive">
                        overdue
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-muted-foreground">
                    <span>
                      P{row.tier} · {row.score}
                    </span>
                    <span>{row.owner ? row.owner.split(/\s+/)[0] : 'unowned'}</span>
                  </div>
                </Link>
              ))}
              {stage.leads.length === 0 && (
                <div className="px-1 py-3 text-center text-xs text-muted-foreground">—</div>
              )}
            </div>
          </div>
        ))}
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
