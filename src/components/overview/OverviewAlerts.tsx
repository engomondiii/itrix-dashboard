import Link from "next/link";
import { SparklesIcon, TriangleAlertIcon } from "lucide-react";

import { ROUTES } from "@/constants/routes";

/** New-leads + overdue-SLA banners (rendered only when relevant). */
export function OverviewAlerts({
  newLeads,
  overdue,
}: {
  newLeads: number;
  overdue: number;
}) {
  if (newLeads === 0 && overdue === 0) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {newLeads > 0 && (
        <Link
          href={ROUTES.leads}
          className="flex flex-1 items-center gap-2 rounded-md border border-sapphire-100 bg-sapphire-50 px-3 py-2 text-sec text-sapphire-700"
        >
          <SparklesIcon className="size-4" />
          {newLeads} new lead{newLeads === 1 ? "" : "s"} awaiting review
        </Link>
      )}
      {overdue > 0 && (
        <Link
          href={ROUTES.followUpOverdue}
          className="flex flex-1 items-center gap-2 rounded-md border border-error/20 bg-error-soft px-3 py-2 text-sec text-error-text"
        >
          <TriangleAlertIcon className="size-4" />
          {overdue} follow-up{overdue === 1 ? "" : "s"} past SLA
        </Link>
      )}
    </div>
  );
}
