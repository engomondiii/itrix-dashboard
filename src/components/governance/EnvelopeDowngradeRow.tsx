import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { formatDateTime } from "@/lib/formatting";
import type { EnvelopeDowngrade } from "@/types/streaming";

/**
 * One turn the pre-flight envelope refused to stream.
 *
 * The envelope working as designed, not an error: a turn that would require
 * level-4 or level-5 approval does not stream at all — the visitor immediately
 * sees the approved under-review wording and the turn enters the queue.
 * Nothing about a high-risk claim is ever rendered provisionally.
 *
 * Worth watching in aggregate rather than individually: a rising rate means
 * retrieval is pulling higher-claim content than the plane should be reaching.
 */
export function EnvelopeDowngradeRow({ downgrade }: { downgrade: EnvelopeDowngrade }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-soft bg-surface px-3 py-2">
      <span className="flex flex-wrap items-center gap-2">
        <Badge variant="warning">
          L{downgrade.requestedLevel} → L{downgrade.allowedLevel}
        </Badge>
        <Link
          href={ROUTES.thread(downgrade.threadId)}
          className="text-sec text-ink-primary hover:underline"
        >
          {downgrade.threadTitle}
        </Link>
        <span className="text-caption text-ink-secondary">{downgrade.agent}</span>
      </span>
      <span className="text-micro text-ink-secondary">
        {formatDateTime(downgrade.at)}
      </span>
    </li>
  );
}
