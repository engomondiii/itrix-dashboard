import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { NDAActionsMenu } from "@/components/nda/NDAActionsMenu";
import { NDAChecklistDisplay } from "@/components/nda/NDAChecklistDisplay";
import { NDAMarkCompleteButton } from "@/components/nda/NDAMarkCompleteButton";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import type { NDARecord, NDAStatus } from "@/types/nda";

const STATUS_VARIANT: Record<
  NDAStatus,
  "info" | "warning" | "success" | "error" | "neutral"
> = {
  required: "info",
  sent: "warning",
  signed: "success",
  declined: "error",
  expired: "neutral",
};

const PENDING_STATUSES: NDAStatus[] = ["required", "sent"];

export function NDAStatusCard({ nda }: { nda: NDARecord }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-1">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={ROUTES.ndaLead(nda.leadId)}
          className="text-sec font-medium text-ink-900 hover:text-sapphire-600"
        >
          {nda.leadName}
        </Link>
        <Badge variant={STATUS_VARIANT[nda.status]}>{nda.status}</Badge>
        <span className="ml-auto text-caption text-ink-400">
          {nda.signedAt ? `Signed ${formatDate(nda.signedAt)}` : `Requested ${formatDate(nda.requestedAt)}`}
        </span>
      </div>
      <div className="mt-3">
        <NDAChecklistDisplay items={nda.checklist} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <NDAMarkCompleteButton leadId={nda.leadId} signed={nda.status === "signed"} />
        {PENDING_STATUSES.includes(nda.status) && (
          <NDAActionsMenu leadId={nda.leadId} />
        )}
      </div>
    </div>
  );
}
