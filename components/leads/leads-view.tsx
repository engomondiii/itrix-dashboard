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
import { useBulkLeadAction, useLeads, usePipeline } from '@/lib/leads/hooks';
import { useToast } from '@/components/ui/toast';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { ShowMore, useCapped } from '@/components/today/use-capped';
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
  const pageSize = [20, 50, 100].includes(Number(searchParams.get('n')))
    ? Number(searchParams.get('n'))
    : 20;
  const sort = (searchParams.get('sort') as SortField) || 'submittedAt';
  const dir: SortDir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';
  const mine = searchParams.get('mine') === '1';
  const who = searchParams.get('who'); // null | 'named' | 'unnamed'

  // The input is instant; the URL (and therefore the server query) follows
  // the debounced value — one request per pause, not per keystroke.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput);

  // Bulk selection: page-scoped; cleared by setParams on any filter change.
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      // Any filter change resets pagination — and the bulk selection, which
      // is page-scoped by definition.
      if (!('page' in patch)) next.delete('page');
      setSelected(new Set());
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Writes the URL directly (no setState) — the effect-safe subset of
  // setParams. Selection survives a search refinement; the ids stay valid.
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    const next = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) next.set('q', debouncedSearch);
    else next.delete('q');
    next.delete('page');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [debouncedSearch, urlSearch, searchParams, router, pathname]);

  const setSort = useCallback(
    (field: SortField) => {
      // Same column toggles direction; a new column starts at its natural end.
      if (sort === field) setParams({ dir: dir === 'desc' ? 'asc' : 'desc' });
      else setParams({ sort: field, dir: field === 'tier' ? 'asc' : 'desc' });
    },
    [sort, dir, setParams],
  );

  const { user } = useAuth();

  // List = filtered query; board = the real pipeline endpoint. "Mine" is a
  // real server-side owner filter; named/unnamed is client-side per page
  // (identity isn't a queryable field on the backend).
  const leads = useLeads({
    status: stage,
    tier,
    owner: mine && user?.email ? user.email : undefined,
    search: urlSearch,
    page,
    pageSize,
    sort,
    dir,
  });
  const pipeline = usePipeline(view === 'board');
  const rows = (leads.data?.results ?? []).filter((row) => {
    const named = Boolean(row.company || row.visitorName);
    if (who === 'named') return named;
    if (who === 'unnamed') return !named;
    return true;
  });

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));

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
            <Chip active={mine} onClick={() => setParams({ mine: mine ? null : '1' })}>
              Mine
            </Chip>
            <Chip active={who === 'named'} onClick={() => setParams({ who: who === 'named' ? null : 'named' })}>
              Known
            </Chip>
            <Chip
              active={who === 'unnamed'}
              onClick={() => setParams({ who: who === 'unnamed' ? null : 'unnamed' })}
            >
              Unknown
            </Chip>
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

          {selected.size > 0 && <BulkBar selected={selected} onClear={() => setSelected(new Set())} />}

          <LeadTable
            rows={rows}
            isLoading={leads.isLoading}
            sort={sort}
            dir={dir}
            onSort={setSort}
            selected={selected}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
          />

          {(leads.data?.count ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span data-numeric>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, leads.data!.count)} of{' '}
                {leads.data!.count} leads
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs">
                  Per page
                  <select
                    value={pageSize}
                    onChange={(e) => setParams({ n: e.target.value === '20' ? null : e.target.value })}
                    className="h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
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

function BulkBar({ selected, onClear }: { selected: Set<string>; onClear: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const bulk = useBulkLeadAction();
  const [stageTo, setStageTo] = useState<LeadStatus | ''>('');
  const ids = [...selected];

  function report(result: { done: number; failed: number }, verb: string) {
    toast({
      title: result.failed
        ? `${verb} ${result.done}, ${result.failed} failed`
        : `${verb} ${result.done} lead${result.done === 1 ? '' : 's'}`,
      tone: result.failed ? 'destructive' : 'success',
    });
    onClear();
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
      <span className="font-medium" data-numeric>
        {selected.size} selected
      </span>
      {user?.email && (
        <Button
          size="sm"
          variant="outline"
          disabled={bulk.isPending}
          onClick={() =>
            bulk.mutate(
              { kind: 'assign', ids, owner: user.email },
              {
                onSuccess: (r) => report(r, 'Assigned'),
                onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
              },
            )
          }
        >
          Assign to me
        </Button>
      )}
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Move to
        <select
          value={stageTo}
          onChange={(e) => setStageTo(e.target.value as LeadStatus)}
          className="h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">stage…</option>
          {[...LIST_STAGES, ...PARKED_STAGES].map((stageOption) => (
            <option key={stageOption} value={stageOption}>
              {stageOption}
            </option>
          ))}
        </select>
      </label>
      <Button
        size="sm"
        disabled={bulk.isPending || !stageTo}
        onClick={() =>
          stageTo &&
          bulk.mutate(
            { kind: 'status', ids, status: stageTo },
            {
              onSuccess: (r) => report(r, 'Moved'),
              onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
            },
          )
        }
      >
        {bulk.isPending ? 'Working…' : 'Apply'}
      </Button>
      <Button size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}

function LeadTable({
  rows,
  isLoading,
  sort,
  dir,
  onSort,
  selected,
  onToggleRow,
  onToggleAll,
}: {
  rows: LeadRow[];
  isLoading: boolean;
  sort: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
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
            <th className="w-10 px-4 py-2.5">
              <input
                type="checkbox"
                aria-label="Select all on this page"
                checked={rows.length > 0 && selected.size === rows.length}
                onChange={onToggleAll}
                className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
              />
            </th>
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
                <input
                  type="checkbox"
                  aria-label={`Select ${row.company || row.visitorName || 'lead'}`}
                  checked={selected.has(row.id)}
                  onChange={() => onToggleRow(row.id)}
                  className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                />
              </td>
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
          <BoardColumn key={stage.status} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function BoardColumn({ stage }: { stage: PipelineStage }) {
  const { visible, remaining, showMore } = useCapped(stage.leads);
  return (
    <div className="w-56 shrink-0 rounded-xl bg-muted/50 p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold">{stageLabel(stage.status)}</span>
        <span className="text-xs text-muted-foreground" data-numeric>
          {stage.count}
        </span>
      </div>
      <div className="space-y-2">
        {visible.map((row) => (
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
        <ShowMore remaining={remaining} onClick={showMore} />
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
