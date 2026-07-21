import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CoverageMeter } from "@/components/threads/CoverageMeter";
import { StopReasonBadge } from "@/components/threads/StopReasonBadge";
import { ROUTES } from "@/constants/routes";
import type { CockpitLead } from "@/types/cockpit";
import { SCAN_VERDICT_INTENT, SCAN_VERDICT_LABEL } from "@/types/attachment";

/**
 * The conversation behind this lead.
 *
 * A Lead is a record; a Thread is the conversation that produced it, and it
 * existed first. This card is the bridge — it answers "is the visitor here
 * right now, how much did we actually gather, and what did they upload?"
 * without the operator having to go looking for the thread.
 *
 * Nothing here is renderable to a visitor: coverage, stop reasons and scan
 * verdicts are all on the client-plane deny-list.
 */
export function LiveThreadCard({ cockpit }: { cockpit: CockpitLead }) {
  if (!cockpit.threadId) {
    return (
      <p className="text-caption text-ink-secondary">
        No conversation is linked to this lead.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {cockpit.live ? (
          <Badge variant="success">Visitor is in the thread now</Badge>
        ) : (
          <Badge variant="neutral">Not connected</Badge>
        )}
        {cockpit.loop &&
          (cockpit.loop.open ? (
            <Badge variant="info">Question loop open</Badge>
          ) : (
            <StopReasonBadge stopReason={cockpit.loop.stopReason} />
          ))}
        {cockpit.attachments && cockpit.attachments.count > 0 && (
          <Badge
            variant={
              cockpit.attachments.worstScan && cockpit.attachments.worstScan !== "clean"
                ? SCAN_VERDICT_INTENT[cockpit.attachments.worstScan]
                : "neutral"
            }
          >
            {cockpit.attachments.count} attachment
            {cockpit.attachments.count === 1 ? "" : "s"}
            {cockpit.attachments.worstScan && cockpit.attachments.worstScan !== "clean"
              ? ` · ${SCAN_VERDICT_LABEL[cockpit.attachments.worstScan]}`
              : ""}
          </Badge>
        )}
      </div>

      {cockpit.coverage && (
        <CoverageMeter
          covered={cockpit.coverage.covered}
          partial={cockpit.coverage.partial}
          unknown={cockpit.coverage.unknown}
        />
      )}

      <Link
        href={ROUTES.thread(cockpit.threadId)}
        className="inline-block text-caption font-medium text-ink-primary hover:underline"
      >
        Open the live thread →
      </Link>
    </div>
  );
}
