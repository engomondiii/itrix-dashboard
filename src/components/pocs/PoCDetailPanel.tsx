import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoCStatusBadge } from "@/components/pocs/PoCStatusBadge";
import { PoCMilestoneTracker } from "@/components/pocs/PoCMilestoneTracker";
import { PoCKPIDisplay } from "@/components/pocs/PoCKPIDisplay";
import { PoCRiskLog } from "@/components/pocs/PoCRiskLog";
import { ROUTES } from "@/constants/routes";
import type { PoC } from "@/types/poc";

export function PoCDetailPanel({ poc }: { poc: PoC }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <PoCKPIDisplay kpis={poc.kpis} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk log</CardTitle>
          </CardHeader>
          <CardContent>
            <PoCRiskLog risks={poc.risks} />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Milestones</CardTitle>
              <PoCStatusBadge status={poc.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PoCMilestoneTracker milestones={poc.milestones} />
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
