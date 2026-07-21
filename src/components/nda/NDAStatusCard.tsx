import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { NDAActionsMenu } from "@/components/nda/NDAActionsMenu";
import { NDAChecklistDisplay } from "@/components/nda/NDAChecklistDisplay";
import { NDAMarkCompleteButton } from "@/components/nda/NDAMarkCompleteButton";
import { NDASendButton } from "@/components/nda/NDASendButton";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import type { NDAListItem, NDAStatus } from "@/types/nda";

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

export function NDAStatusCard({ nda }: { nda: NDAListItem }) {
  return (
    <div className="rounded-md border border-border-soft bg-surface p-4 shadow-1">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={ROUTES.ndaLead(nda.leadId)}
          className="text-sec font-medium text-ink-primary hover:text-ink-primary"
        >
          {nda.leadName}
        </Link>
        <Badge variant={STATUS_VARIANT[nda.status]}>{nda.status}</Badge>
        <span className="ml-auto text-caption text-ink-secondary">
          {nda.signedAt ? `Signed ${formatDate(nda.signedAt)}` : `Requested ${formatDate(nda.requestedAt)}`}
        </span>
      </div>
      {nda.status === "declined" && nda.declineReason && (
        <p className="mt-2 text-caption text-error-text">
          Declined: {nda.declineReason}
        </p>
      )}
      <div className="mt-3">
        <NDAChecklistDisplay items={nda.checklist} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5">
        {nda.status === "required" && <NDASendButton nda={nda} />}
        {nda.status === "sent" && (
          <NDAMarkCompleteButton leadId={nda.leadId} signed={false} />
        )}
        {PENDING_STATUSES.includes(nda.status) && (
          <NDAActionsMenu leadId={nda.leadId} />
        )}
      </div>
    </div>
  );
}
