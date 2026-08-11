'use client';

/**
 * Customers — one hub, two sections:
 *
 *   Customers        the health board (licensed accounts), worst first —
 *                    server-sorted; click through to the account page
 *   Deals in flight  evaluations + PoCs, editable in place (status,
 *                    KPI results, milestones) — they used to be four pages
 *
 * The team plane has no customer writes and no outcomes/plan/team payloads —
 * this screen only promises what it can deliver.
 */

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { normalizeError } from '@/lib/api/errors';
import {
  useCustomers,
  useEvaluations,
  useEvaluationMutation,
  usePocs,
  usePocMutation,
} from '@/lib/customers/hooks';
import { ShowMore, useCapped } from '@/components/today/use-capped';
import type {
  CustomerRow,
  Evaluation,
  EvaluationStatus,
  HealthClass,
  MilestoneStatus,
  Poc,
  PocStatus,
} from '@/lib/customers/types';

const HEALTH_STYLE: Record<HealthClass, string> = {
  critical: 'bg-destructive-soft text-destructive',
  at_risk: 'bg-warning-soft text-warning',
  unknown: 'bg-secondary text-secondary-foreground',
  stable: 'bg-positive-soft text-positive',
};

const HEALTH_LABEL: Record<HealthClass, string> = {
  critical: 'Critical',
  at_risk: 'At risk',
  unknown: 'Unknown',
  stable: 'Stable',
};

const EVAL_STATUSES: EvaluationStatus[] = ['proposed', 'in_progress', 'delivered', 'won', 'lost'];
const POC_STATUSES: PocStatus[] = ['planning', 'active', 'completed', 'stalled', 'cancelled'];
const MILESTONE_NEXT: Record<MilestoneStatus, MilestoneStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
  missed: 'in_progress',
};

function CustomerCard({ row }: { row: CustomerRow }) {
  return (
    <Link
      href={`/customers/${row.clientId}`}
      className="glass-surface block rounded-xl px-4 py-3 hover:bg-accent/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{row.company}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', HEALTH_STYLE[row.healthClass])}>
          {HEALTH_LABEL[row.healthClass]}
        </span>
        {row.blockingSupport && (
          <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-semibold text-destructive">
            blocking support
          </span>
        )}
      </div>
      {row.reasons.length > 0 && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{row.reasons.join(' · ')}</p>
      )}
    </Link>
  );
}

function KpiEditor({
  evaluationId,
  kpi,
}: {
  evaluationId: string;
  kpi: Evaluation['kpis'][number];
}) {
  const { toast } = useToast();
  const mutate = useEvaluationMutation();
  const [result, setResult] = useState(kpi.result ?? '');

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="min-w-0 flex-1 truncate">
        {kpi.metric}
        {kpi.target && <span className="text-muted-foreground"> (target {kpi.target})</span>}
      </span>
      <input
        value={result}
        onChange={(e) => setResult(e.target.value)}
        placeholder="result"
        className="h-7 w-24 rounded-md border border-input bg-card px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={mutate.isPending || result === (kpi.result ?? '')}
        onClick={() =>
          mutate.mutate(
            { kind: 'kpi', id: evaluationId, kpiId: kpi.id, result },
            {
              onSuccess: () => toast({ title: 'KPI updated', tone: 'success' }),
              onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
            },
          )
        }
      >
        Save
      </Button>
    </div>
  );
}

function EvaluationCard({ row }: { row: Evaluation }) {
  const { toast } = useToast();
  const mutate = useEvaluationMutation();
  const [open, setOpen] = useState(false);

  return (
    <article className="glass-surface rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={`/leads/${row.leadId}`} className="font-medium hover:underline">
          {row.company || row.leadName}
        </Link>
        <span className="text-xs text-muted-foreground">Evaluation · {row.pkg}</span>
        <select
          value={row.status}
          disabled={mutate.isPending}
          onChange={(e) =>
            mutate.mutate(
              { kind: 'status', id: row.id, status: e.target.value as EvaluationStatus },
              {
                onSuccess: () => toast({ title: `Evaluation ${e.target.value}`, tone: 'success' }),
                onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
              },
            )
          }
          className="ml-auto h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {EVAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        {row.kpis.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-muted-foreground underline"
          >
            {open ? 'hide' : `${row.kpis.length} KPIs`}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 space-y-1.5 border-t border-border/60 pt-2">
          {row.kpis.map((kpi) => (
            <KpiEditor key={kpi.id} evaluationId={row.id} kpi={kpi} />
          ))}
        </div>
      )}
    </article>
  );
}

function PocCard({ row }: { row: Poc }) {
  const { toast } = useToast();
  const mutate = usePocMutation();
  const [open, setOpen] = useState(false);
  const done = row.milestones.filter((m) => m.status === 'done').length;

  return (
    <article className="glass-surface rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={`/leads/${row.leadId}`} className="font-medium hover:underline">
          {row.company || row.leadName}
        </Link>
        <span className="text-xs text-muted-foreground">
          PoC · {done}/{row.milestones.length} milestones
        </span>
        <select
          value={row.status}
          disabled={mutate.isPending}
          onChange={(e) =>
            mutate.mutate(
              { kind: 'status', id: row.id, status: e.target.value as PocStatus },
              {
                onSuccess: () => toast({ title: `PoC ${e.target.value}`, tone: 'success' }),
                onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
              },
            )
          }
          className="ml-auto h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {POC_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(row.milestones.length > 0 || row.risks.length > 0) && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-muted-foreground underline"
          >
            {open ? 'hide' : 'details'}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 space-y-2 border-t border-border/60 pt-2">
          {row.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-xs">
              <button
                type="button"
                disabled={mutate.isPending}
                onClick={() =>
                  mutate.mutate(
                    { kind: 'milestone', id: row.id, milestoneId: m.id, status: MILESTONE_NEXT[m.status] },
                    { onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }) },
                  )
                }
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  m.status === 'done' && 'bg-positive-soft text-positive',
                  m.status === 'in_progress' && 'bg-secondary',
                  m.status === 'pending' && 'bg-muted text-muted-foreground',
                  m.status === 'missed' && 'bg-destructive-soft text-destructive',
                )}
                title="Click to advance: pending → in progress → done"
              >
                {m.status.replace('_', ' ')}
              </button>
              <span>{m.label}</span>
            </div>
          ))}
          {row.risks.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {row.risks.map((r) => (
                <li key={r.id}>
                  <span
                    className={cn(
                      'mr-1.5 font-semibold',
                      r.severity === 'high' ? 'text-destructive' : r.severity === 'medium' ? 'text-warning' : '',
                    )}
                  >
                    {r.severity}
                  </span>
                  {r.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

export function CustomersView() {
  const customers = useCustomers();
  const evaluations = useEvaluations();
  const pocs = usePocs();

  // Server-side the board is unfiltered — tabs, search and the health chips
  // are ours. Tabs, not stacked sections: each side can be hundreds of rows.
  const [tab, setTab] = useState<'accounts' | 'deals'>('accounts');
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<HealthClass | ''>('');
  const needle = search.trim().toLowerCase();

  const customerRows = (customers.data?.results ?? []).filter(
    (row) =>
      (!needle || row.company.toLowerCase().includes(needle)) &&
      (!health || row.healthClass === health),
  );
  const deals = [
    ...(evaluations.data?.results ?? []).filter((e) => e.status !== 'won' && e.status !== 'lost'),
    ...(pocs.data?.results ?? []).filter((p) => p.status !== 'completed' && p.status !== 'cancelled'),
  ].filter((d) => !needle || (d.company || d.leadName).toLowerCase().includes(needle));

  return (
    <section>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Licensed accounts by health, and every deal still in flight.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company…"
          className="h-8 w-48 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border p-0.5" role="tablist">
          {(
            [
              ['accounts', `Accounts ${customerRows.length}`],
              ['deals', `Deals in flight ${deals.length}`],
            ] as const
          ).map(([key, label]) => (
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
              {label}
            </button>
          ))}
        </div>
        {tab === 'accounts' &&
          (['critical', 'at_risk', 'stable'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHealth(health === h ? '' : h)}
              aria-pressed={health === h}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                health === h
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {HEALTH_LABEL[h]}
            </button>
          ))}
      </div>

      {tab === 'accounts' &&
        (customers.isLoading && customerRows.length === 0 ? (
          <div className="glass-surface animate-pulse rounded-xl p-8 text-sm text-muted-foreground">Loading…</div>
        ) : customerRows.length === 0 ? (
          <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
            No licensed accounts{needle ? ' match the search' : ' yet'}.
          </div>
        ) : (
          <AccountsGrid rows={customerRows} />
        ))}

      {tab === 'deals' &&
        (deals.length === 0 ? (
          <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
            Nothing in flight{needle ? ' matches the search' : ''}.
          </div>
        ) : (
          <DealsList deals={deals} />
        ))}
    </section>
  );
}

function AccountsGrid({ rows }: { rows: CustomerRow[] }) {
  const { visible, remaining, showMore } = useCapped(rows);
  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((row) => (
          <CustomerCard key={row.clientId} row={row} />
        ))}
      </div>
      <div className="mt-2">
        <ShowMore remaining={remaining} onClick={showMore} />
      </div>
      {rows.length >= 500 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the worst 500 accounts — the backend has no paging beyond that yet.
        </p>
      )}
    </div>
  );
}

function DealsList({ deals }: { deals: Array<Evaluation | Poc> }) {
  const { visible, remaining, showMore } = useCapped(deals);
  return (
    <div className="space-y-2">
      {visible.map((deal) =>
        'pkg' in deal ? (
          <EvaluationCard key={`ev-${deal.id}`} row={deal} />
        ) : (
          <PocCard key={`poc-${deal.id}`} row={deal} />
        ),
      )}
      <ShowMore remaining={remaining} onClick={showMore} />
    </div>
  );
}
