"use client";

import Link from "next/link";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { PoCKPIDisplay } from "@/components/pocs/PoCKPIDisplay";
import { PoCMilestoneTracker } from "@/components/pocs/PoCMilestoneTracker";
import { PoCRiskLog } from "@/components/pocs/PoCRiskLog";
import { PoCStatusBadge } from "@/components/pocs/PoCStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { usePoCActions } from "@/hooks/useDeals";
import { POC_STATUSES, POC_STATUS_LABELS, type PoC } from "@/types/poc";

export function PoCDetailPanel({ poc }: { poc: PoC }) {
  const { setStatus } = usePoCActions(poc.id);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {(poc.scope || poc.successMetrics || poc.durationWeeks || poc.startDate) && (
          <Card>
            <CardHeader>
              <CardTitle>Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {poc.scope && (
                <div>
                  <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                    Scope
                  </div>
                  <p className="text-sec text-ink-secondary">{poc.scope}</p>
                </div>
              )}
              {poc.successMetrics && (
                <div>
                  <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
                    Success metrics
                  </div>
                  <p className="text-sec text-ink-secondary">{poc.successMetrics}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sec text-ink-secondary">
                {poc.durationWeeks && (
                  <span>
                    <span className="text-ink-secondary">Duration:</span> {poc.durationWeeks} weeks
                  </span>
                )}
                {poc.startDate && (
                  <span>
                    <span className="text-ink-secondary">Starts:</span> {poc.startDate}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <PoCKPIDisplay pocId={poc.id} kpis={poc.kpis} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk log</CardTitle>
          </CardHeader>
          <CardContent>
            <PoCRiskLog pocId={poc.id} risks={poc.risks} />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Milestones</CardTitle>
              <div className="flex items-center gap-1.5">
                <PoCStatusBadge status={poc.status} />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Change PoC status"
                    className="inline-flex size-7 items-center justify-center rounded-md text-ink-secondary outline-none hover:bg-muted hover:text-ink-secondary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronDownIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {POC_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setStatus.mutate(s)}
                      >
                        {POC_STATUS_LABELS[s]}
                        {s === poc.status && <CheckIcon className="ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PoCMilestoneTracker pocId={poc.id} milestones={poc.milestones} />
            <Link
              href={ROUTES.lead(poc.leadId)}
              className="inline-block text-sec font-medium text-ink-primary"
            >
              Open lead →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
