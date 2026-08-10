'use client';

/**
 * One account. The team plane serves exactly: the health row + contractState,
 * and the support queue filtered to this client. Outcomes / success plan /
 * team live on the client plane (unreachable with a team JWT) — we say so
 * instead of rendering empty scaffolding.
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/entity/format';
import { useCustomer, useCustomerSupport } from '@/lib/customers/hooks';
import type { HealthClass } from '@/lib/customers/types';

const HEALTH_STYLE: Record<HealthClass, string> = {
  critical: 'bg-destructive-soft text-destructive',
  at_risk: 'bg-warning-soft text-warning',
  unknown: 'bg-secondary text-secondary-foreground',
  stable: 'bg-positive-soft text-positive',
};

export function CustomerDetailView({ clientId }: { clientId: string }) {
  const customer = useCustomer(clientId);
  const support = useCustomerSupport(clientId);

  const detail = customer.data;

  if (customer.isLoading) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!detail) {
    return (
      <p className="text-sm text-muted-foreground">
        Account not found. <Link href="/customers" className="underline">Back to customers.</Link>
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-5">
        <Link
          href="/customers"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All customers
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display tracking-display text-2xl font-semibold">{detail.company}</h1>
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', HEALTH_STYLE[detail.healthClass])}>
            {detail.healthClass.replace('_', ' ')}
          </span>
          {detail.contractState && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{detail.contractState}</span>
          )}
        </div>
      </header>

      <div className="glass-surface mb-4 rounded-xl p-4">
        <h2 className="font-display tracking-display mb-2 text-sm font-semibold">Why this health</h2>
        {detail.reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No flags — nothing is dragging this account down.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {detail.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {detail.outcomesOffPlan > 0 && `${detail.outcomesOffPlan} outcome(s) off plan · `}
          {detail.degradedDeployments > 0 && `${detail.degradedDeployments} degraded deployment(s) · `}
          {detail.negativePulse && 'negative pulse · '}
          expansion {detail.expansionAllowed ? 'allowed' : 'on hold'}
        </p>
      </div>

      <div className="glass-surface rounded-xl p-4">
        <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
          Support requests{' '}
          <span className="font-sans text-xs font-normal text-muted-foreground">
            — read-only here; handled outside the dashboard for now
          </span>
        </h2>
        {support.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (support.data?.results.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No support requests.</p>
        ) : (
          <ul className="space-y-2">
            {support.data!.results.map((row) => (
              <li key={row.requestId} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <p className="font-medium">
                  {row.subject}
                  {row.blocking && (
                    <span className="ml-2 rounded-full bg-destructive-soft px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      blocking
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.status.replace(/_/g, ' ')} · {row.urgency}
                  {row.slaBreaching && ' · past its response window'} · {row.owner || 'unowned'} · opened{' '}
                  {formatRelative(row.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Outcome tracking, success plans, and the relationship team live in the customer&apos;s own
        portal and aren&apos;t exposed to staff accounts yet.
      </p>
    </section>
  );
}
