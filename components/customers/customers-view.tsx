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
import { PaginationFooter, useClientPage } from '@/components/shared/client-pagination';
import { Stamp } from '@/components/shared/timestamp';
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

const HEALTH_RANK: Record<HealthClass, number> = { critical: 0, at_risk: 1, unknown: 2, stable: 3 };

function AccountsTable({ rows }: { rows: CustomerRow[] }) {
  const [sort, setSort] = useState<'health' | 'company'>('health');
  const sorted = [...rows].sort((a, b) =>
    sort === 'company'
      ? a.company.localeCompare(b.company)
      : HEALTH_RANK[a.healthClass] - HEALTH_RANK[b.healthClass] || a.company.localeCompare(b.company),
  );
  const pager = useClientPage(sorted);

  const header = (label: string, key: 'health' | 'company') => (
    <th className="px-4 py-2.5 font-medium">
      <button
        type="button"
        onClick={() => setSort(key)}
        className={cn('hover:text-foreground', sort === key && 'text-foreground')}
      >
        {label}
      </button>
    </th>
  );

  return (
    <div>
      <div className="glass-surface overflow-x-auto rounded-xl">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {header('Company', 'company')}
              {header('Health', 'health')}
              <th className="px-4 py-2.5 font-medium">Why</th>
              <th className="px-4 py-2.5 font-medium">Flags</th>
              <th className="px-4 py-2.5 font-medium">Expansion</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageRows.map((row) => (
              <tr key={row.clientId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-2.5">
                  <Link href={`/customers/${row.clientId}`} className="font-medium hover:underline">
                    {row.company}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', HEALTH_STYLE[row.healthClass])}>
                    {HEALTH_LABEL[row.healthClass]}
                  </span>
                </td>
                <td className="max-w-[28ch] truncate px-4 py-2.5 text-xs text-muted-foreground">
                  {row.reasons.join(' - ') || '—'}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {[
                    row.blockingSupport ? 'blocking support' : null,
                    row.outcomesOffPlan > 0 ? `${row.outcomesOffPlan} off-plan` : null,
                    row.negativePulse ? 'negative pulse' : null,
                    row.degradedDeployments > 0 ? `${row.degradedDeployments} degraded` : null,
                  ]
                    .filter(Boolean)
                    .join(' - ') || '—'}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {row.expansionAllowed ? 'allowed' : 'on hold'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter
        page={pager.page}
        pageSize={pager.pageSize}
        total={pager.total}
        totalPages={pager.totalPages}
        noun="accounts"
        onPage={pager.setPage}
        onPageSize={pager.setPageSize}
      />
      {rows.length >= 500 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the worst 500 accounts — the backend has no paging beyond that yet.
        </p>
      )}
    </div>
  );
}

function DealsTable({ deals }: { deals: Array<Evaluation | Poc> }) {
  const [sort, setSort] = useState<'company' | 'status' | 'updated'>('updated');
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = [...deals].sort((a, b) => {
    if (sort === 'company') return (a.company || a.leadName).localeCompare(b.company || b.leadName);
    if (sort === 'status') return a.status.localeCompare(b.status);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const pager = useClientPage(sorted);

  const header = (label: string, key: 'company' | 'status' | 'updated') => (
    <th className="px-4 py-2.5 font-medium">
      <button
        type="button"
        onClick={() => setSort(key)}
        className={cn('hover:text-foreground', sort === key && 'text-foreground')}
      >
        {label}
      </button>
    </th>
  );

  return (
    <div>
      <div className="glass-surface overflow-x-auto rounded-xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {header('Company', 'company')}
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Scope</th>
              {header('Status', 'status')}
              {header('Updated', 'updated')}
              <th className="px-4 py-2.5 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageRows.map((deal) => {
              const rowId = `${'pkg' in deal ? 'ev' : 'poc'}-${deal.id}`;
              return (
                <DealRow
                  key={rowId}
                  deal={deal}
                  open={openId === rowId}
                  onToggle={() => setOpenId(openId === rowId ? null : rowId)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationFooter
        page={pager.page}
        pageSize={pager.pageSize}
        total={pager.total}
        totalPages={pager.totalPages}
        noun="deals"
        onPage={pager.setPage}
        onPageSize={pager.setPageSize}
      />
    </div>
  );
}

function DealRow({
  deal,
  open,
  onToggle,
}: {
  deal: Evaluation | Poc;
  open: boolean;
  onToggle: () => void;
}) {
  const { toast } = useToast();
  const evalMutate = useEvaluationMutation();
  const pocMutate = usePocMutation();
  const isEval = 'pkg' in deal;
  const done = !isEval ? deal.milestones.filter((m) => m.status === 'done').length : 0;

  return (
    <>
      <tr className="border-b border-border/60 hover:bg-accent/40">
        <td className="px-4 py-2.5">
          <Link href={`/leads/${deal.leadId}`} className="font-medium hover:underline">
            {deal.company || deal.leadName}
          </Link>
        </td>
        <td className="px-4 py-2.5 text-xs">{isEval ? 'Evaluation' : 'PoC'}</td>
        <td className="max-w-[26ch] truncate px-4 py-2.5 text-xs text-muted-foreground">
          {isEval ? deal.pkg : deal.scope || `${done}/${deal.milestones.length} milestones`}
        </td>
        <td className="px-4 py-2.5">
          {isEval ? (
            <select
              value={deal.status}
              disabled={evalMutate.isPending}
              onChange={(e) =>
                evalMutate.mutate(
                  { kind: 'status', id: deal.id, status: e.target.value as EvaluationStatus },
                  {
                    onSuccess: () => toast({ title: `Evaluation ${e.target.value}`, tone: 'success' }),
                    onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
                  },
                )
              }
              className="h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {EVAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={deal.status}
              disabled={pocMutate.isPending}
              onChange={(e) =>
                pocMutate.mutate(
                  { kind: 'status', id: deal.id, status: e.target.value as PocStatus },
                  {
                    onSuccess: () => toast({ title: `PoC ${e.target.value}`, tone: 'success' }),
                    onError: (err) => toast({ title: normalizeError(err).message, tone: 'destructive' }),
                  },
                )
              }
              className="h-7 rounded-md border border-input bg-card px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {POC_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground"><Stamp at={deal.updatedAt} /></td>
        <td className="px-4 py-2.5">
          <button type="button" onClick={onToggle} className="text-xs text-muted-foreground underline">
            {open ? 'hide' : isEval ? `${deal.kpis.length} KPIs` : 'milestones'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-border/60 bg-muted/30">
          <td colSpan={6} className="px-4 py-3">
            {isEval ? (
              <div className="space-y-1.5">
                {deal.kpis.map((kpi) => (
                  <KpiEditor key={kpi.id} evaluationId={deal.id} kpi={kpi} />
                ))}
                {deal.kpis.length === 0 && <p className="text-xs text-muted-foreground">No KPIs defined.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {deal.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      disabled={pocMutate.isPending}
                      onClick={() =>
                        pocMutate.mutate(
                          { kind: 'milestone', id: deal.id, milestoneId: m.id, status: MILESTONE_NEXT[m.status] },
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
                      title="Click to advance: pending, in progress, done"
                    >
                      {m.status.replace('_', ' ')}
                    </button>
                    <span>{m.label}</span>
                  </div>
                ))}
                {deal.risks.length > 0 && (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {deal.risks.map((r) => (
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
          </td>
        </tr>
      )}
    </>
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
          <AccountsTable rows={customerRows} />
        ))}

      {tab === 'deals' &&
        (deals.length === 0 ? (
          <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
            Nothing in flight{needle ? ' matches the search' : ''}.
          </div>
        ) : (
          <DealsTable deals={deals} />
        ))}
    </section>
  );
}
