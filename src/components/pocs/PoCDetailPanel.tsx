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
                    className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring"
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
              className="inline-block text-sec font-medium text-sapphire-600"
            >
              Open lead →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
