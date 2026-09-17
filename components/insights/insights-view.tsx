'use client';

/**
 * Insights — the one analytics page. Everything the backend actually
 * measures, nothing it doesn't (there is no won/lost metric anywhere, so
 * none is shown). Single-series charts throughout: one brand hue, direct
 * text labels in ink tokens, values on hover via native titles.
 */

import { useState } from 'react';

import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { useAnalytics, type FunnelStage } from '@/lib/insights/api';
import { useCopy } from '@/lib/i18n/locale-provider';

const RANGES = [
  { days: 7 },
  { days: 30 },
  { days: 90 },
];

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-3 text-sm" title={`${label}: ${count}`}>
      <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{label}</span>
      <div className="h-4 min-w-0 flex-1">
        <div
          className="h-full rounded-r-[4px] bg-chart-1"
          style={{ width: max > 0 ? `${Math.max(1.5, (count / max) * 100)}%` : '0%' }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs" data-numeric>
        {count}
      </span>
    </div>
  );
}

function Funnel({ stages }: { stages: FunnelStage[] }) {
  const copy = useCopy();
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="space-y-2.5">
      {stages.map((stage, i) => (
        <div key={stage.stage}>
          {i > 0 && stage.conversion !== undefined && (
            <p className="mb-0.5 pl-40 text-[11px] text-muted-foreground" data-numeric>
              ↓ {copy.insights.carryOn((stage.conversion * 100).toFixed(1))}
            </p>
          )}
          <BarRow label={copy.insights.funnelStage(stage.stage)} count={stage.count} max={max} />
        </div>
      ))}
    </div>
  );
}

function Trend({ points }: { points: Array<{ date: string; count: number }> }) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <div className="flex h-28 items-end gap-[3px]">
      {points.map((point) => (
        <div
          key={point.date}
          title={`${point.date}: ${point.count}`}
          className="min-w-[4px] flex-1 rounded-t-[4px] bg-chart-1 transition-colors hover:bg-brand-accent"
          style={{ height: `${Math.max(3, (point.count / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('glass-surface rounded-xl p-4', className)}>
      <h2 className="font-display tracking-display mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function InsightsView() {
  const copy = useCopy();
  const [days, setDays] = useState(30);
  const analytics = useAnalytics(days);
  const data = analytics.data;

  return (
    <section>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">
            {copy.insights.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.insights.subtitle}</p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              aria-pressed={days === range.days}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium',
                days === range.days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {copy.insights.rangeDays(range.days)}
            </button>
          ))}
        </div>
      </header>

      {!data ? (
        <div className="glass-surface animate-pulse rounded-xl p-10 text-sm text-muted-foreground">
          {analytics.isLoading ? copy.insights.loading : copy.insights.unavailable}
        </div>
      ) : (
        <div className="space-y-4">
          <StatGrid columns={4}>
            <StatCard
              label={copy.insights.newLeads}
              value={String(data.overview.newLeads)}
              detail={copy.insights.lastDays(days)}
            />
            <StatCard
              label={copy.insights.priority1}
              value={String(data.overview.tier1Count)}
              detail={copy.insights.strategicInPlay}
            />
            <StatCard label={copy.insights.priority2} value={String(data.overview.tier2Count)} />
            <StatCard
              label={copy.insights.overdueFollowUps}
              value={String(data.overview.overdueFollowUps)}
              detail={copy.insights.rightNow}
            />
          </StatGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title={copy.insights.funnelTitle}>
              <Funnel stages={data.funnel} />
            </Section>

            <Section title={copy.insights.responseTimeTitle}>
              <StatGrid columns={2}>
                <StatCard
                  label={copy.insights.p1Average}
                  value={copy.insights.hours(data.sla_compliance.tier1AvgHours)}
                  detail={copy.insights.overTheBar(data.sla_compliance.tier1Breaches)}
                />
                <StatCard
                  label={copy.insights.p2Average}
                  value={copy.insights.hours(data.sla_compliance.tier2AvgHours)}
                  detail={copy.insights.overTheBar(data.sla_compliance.tier2Breaches)}
                />
              </StatGrid>
              <p className="mt-3 text-sm">
                <span className="font-display text-xl font-semibold" data-numeric>
                  {(data.sla_compliance.complianceRate * 100).toFixed(1)}%
                </span>{' '}
                <span className="text-xs text-muted-foreground">{copy.insights.answeredInside}</span>
              </p>
            </Section>
          </div>

          <Section title={copy.insights.submissionsTitle(days)}>
            <Trend points={data.submission_trend} />
          </Section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title={copy.insights.byProductRoute}>
              <div className="space-y-2">
                {Object.entries(data.route_distribution).map(([route, count]) => (
                  <BarRow
                    key={route}
                    label={route}
                    count={count}
                    max={Math.max(...Object.values(data.route_distribution), 1)}
                  />
                ))}
              </div>
            </Section>

            <Section title={copy.insights.byIndustry}>
              <div className="space-y-2">
                {data.industry_breakdown.map((row) => (
                  <BarRow
                    key={row.industry}
                    label={row.industry || copy.insights.unknown}
                    count={row.count}
                    max={Math.max(...data.industry_breakdown.map((r) => r.count), 1)}
                  />
                ))}
              </div>
            </Section>
          </div>

          {data.patterns.length > 0 && (
            <Section title={copy.insights.whatLeadsSay}>
              <div className="flex flex-wrap gap-2">
                {data.patterns.map((pattern) => (
                  <span key={pattern.phrase} className="rounded-full bg-secondary px-3 py-1 text-xs">
                    {pattern.phrase} <span className="text-muted-foreground" data-numeric>×{pattern.count}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </section>
  );
}
