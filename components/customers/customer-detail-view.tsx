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
import { useCustomer, useCustomerSupport } from '@/lib/customers/hooks';
import { ShowMore, useCapped } from '@/components/today/use-capped';
import type { HealthClass } from '@/lib/customers/types';
import { Stamp } from '@/components/shared/timestamp';
import { useCopy } from '@/lib/i18n/locale-provider';

const HEALTH_STYLE: Record<HealthClass, string> = {
  critical: 'bg-destructive-soft text-destructive',
  at_risk: 'bg-warning-soft text-warning',
  unknown: 'bg-secondary text-secondary-foreground',
  stable: 'bg-positive-soft text-positive',
};

export function CustomerDetailView({ clientId }: { clientId: string }) {
  const copy = useCopy();
  const customer = useCustomer(clientId);
  const support = useCustomerSupport(clientId);
  const supportCap = useCapped(support.data?.results ?? []);

  const detail = customer.data;

  if (customer.isLoading) {
    return <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">{copy.customers.loading}</div>;
  }
  if (!detail) {
    return (
      <p className="text-sm text-muted-foreground">
        {copy.customers.notFound}{' '}
        <Link href="/customers" className="underline">
          {copy.customers.backToCustomers}
        </Link>
      </p>
    );
  }

  return (
    <section>
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
        <h2 className="font-display tracking-display mb-2 text-sm font-semibold">{copy.customers.whyThisHealth}</h2>
        {detail.reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.customers.noFlags}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {detail.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {detail.outcomesOffPlan > 0 && `${copy.customers.outcomesOffPlan(detail.outcomesOffPlan)} · `}
          {detail.degradedDeployments > 0 &&
            `${copy.customers.degradedDeployments(detail.degradedDeployments)} · `}
          {detail.negativePulse && `${copy.customers.negativePulse} · `}
          {detail.expansionAllowed ? copy.customers.expansionAllowed : copy.customers.expansionOnHold}
        </p>
      </div>

      <div className="glass-surface rounded-xl p-4">
        <h2 className="font-display tracking-display mb-2 text-sm font-semibold">
          {copy.customers.supportRequests}{' '}
          <span className="font-sans text-xs font-normal text-muted-foreground">
            {copy.customers.supportReadOnly}
          </span>
        </h2>
        {support.isLoading ? (
          <p className="text-sm text-muted-foreground">{copy.customers.loading}</p>
        ) : (support.data?.results.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.customers.noSupportRequests}</p>
        ) : (
          <ul className="space-y-2">
            {supportCap.visible.map((row) => (
              <li key={row.requestId} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <p className="font-medium">
                  {row.subject}
                  {row.blocking && (
                    <span className="ml-2 rounded-full bg-destructive-soft px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      {copy.customers.blocking}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.status.replace(/_/g, ' ')} · {row.urgency}
                  {row.slaBreaching && ` · ${copy.customers.pastResponseWindow}`} ·{' '}
                  {row.owner || copy.customers.unowned} · {copy.customers.opened}{' '}
                  <Stamp at={row.createdAt} />
                </p>
              </li>
            ))}
            <ShowMore remaining={supportCap.remaining} onClick={supportCap.showMore} />
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {copy.customers.portalNote}
      </p>
    </section>
  );
}
