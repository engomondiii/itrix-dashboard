"use client";

import Link from "next/link";
import { useState } from "react";
import { PaperclipIcon, ShieldAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StateBadge } from "@/components/journey/StateBadge";
import { DEFAULT_THREAD_FILTERS, useThreads } from "@/hooks/useThreads";
import { ROUTES } from "@/constants/routes";
import { SCAN_VERDICT_INTENT, SCAN_VERDICT_LABEL } from "@/types/attachment";
import type { ThreadFilterState, ThreadListItem } from "@/types/thread";
import { formatTimeAgo } from "@/lib/formatting";

import { AnonymousBadge } from "./AnonymousBadge";
import { CoverageMeter } from "./CoverageMeter";
import { StopReasonBadge } from "./StopReasonBadge";
import { ThreadFilters } from "./ThreadFilters";

function LiveDot({ live }: { live: boolean }) {
  if (!live) return <span className="text-micro text-ink-muted">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-micro font-medium text-success-text">
      <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
      Live
    </span>
  );
}

/**
 * How long a visitor has been waiting on us.
 *
 * Rendered as an escalating value rather than a neutral duration, because this
 * is the number the approval queue orders by: someone is sitting in front of a
 * conversation that has stopped moving (Surface 2 v5.0 §05.1).
 */
function WaitTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const label = mins >= 1 ? `${mins}m ${seconds % 60}s` : `${seconds}s`;
  return (
    <Badge variant={mins >= 2 ? "error" : "warning"} className="tabular-nums">
      waiting {label}
    </Badge>
  );
}

function ThreadRow({ thread }: { thread: ThreadListItem }) {
  return (
    <TableRow>
      <TableCell className="max-w-[28ch]">
        <Link
          href={ROUTES.thread(thread.id)}
          className="line-clamp-1 font-medium text-ink-primary hover:underline"
        >
          {thread.title}
        </Link>
        <div className="text-micro text-ink-secondary">
          {formatTimeAgo(thread.lastActivityAt)}
          {thread.leadId ? null : " · no lead yet"}
        </div>
      </TableCell>

      <TableCell>
        <AnonymousBadge identityState={thread.identityState} />
      </TableCell>

      <TableCell>
        <StateBadge state={thread.state} />
      </TableCell>

      <TableCell>
        <LiveDot live={thread.live} />
      </TableCell>

      <TableCell>
        <CoverageMeter
          covered={thread.coverage.covered}
          partial={thread.coverage.partial}
          unknown={thread.coverage.unknown}
        />
      </TableCell>

      <TableCell className="text-sec text-ink-secondary">
        {thread.loop.open ? (
          <span className="tabular-nums">
            {thread.loop.questionsAsked} asked · {thread.loop.budgetRemaining} left
          </span>
        ) : (
          <StopReasonBadge stopReason={thread.loop.stopReason} />
        )}
      </TableCell>

      <TableCell>
        {thread.attachments.count === 0 ? (
          <span className="text-micro text-ink-muted">—</span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <PaperclipIcon className="size-3.5 text-ink-secondary" aria-hidden="true" />
            <span className="tabular-nums text-sec text-ink-secondary">
              {thread.attachments.count}
            </span>
            {thread.attachments.worstScan && thread.attachments.worstScan !== "clean" && (
              <Badge variant={SCAN_VERDICT_INTENT[thread.attachments.worstScan]}>
                {SCAN_VERDICT_LABEL[thread.attachments.worstScan]}
              </Badge>
            )}
          </span>
        )}
      </TableCell>

      <TableCell>
        <span className="flex flex-wrap items-center gap-1.5">
          {thread.blocking && <WaitTimer seconds={thread.blocking.waitingSeconds} />}
          {thread.guardHalted && (
            <Badge variant="error">
              <ShieldAlertIcon className="size-3" aria-hidden="true" />
              Guard halt
            </Badge>
          )}
          {!thread.blocking && !thread.guardHalted && (
            <span className="text-micro text-ink-muted">—</span>
          )}
        </span>
      </TableCell>

      <TableCell className="text-sec text-ink-secondary">
        {thread.humanOwner ?? <span className="text-ink-muted">Unassigned</span>}
      </TableCell>
    </TableRow>
  );
}

/**
 * Every conversation in flight, from the visitor's first sentence.
 *
 * Anonymous threads are first-class here. Under v3.0 the team could only see a
 * lead, which meant the first two journey states were invisible — by the time
 * anything appeared, the listening was already over. Ordering puts blocked and
 * live threads at the top: those are the ones where someone is waiting on us.
 */
export function ThreadBoard() {
  const [filters, setFilters] = useState<ThreadFilterState>(DEFAULT_THREAD_FILTERS);
  const query = useThreads(filters);
  const threads = query.data;

  return (
    <div className="space-y-4">
      <ThreadFilters filters={filters} onChange={setFilters} />

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(threads)}
        label="live threads"
      />

      {threads && threads.length === 0 && (
        <EmptyState
          title="No threads match"
          description="Clear a filter, or wait for the next visitor to speak."
        />
      )}

      {threads && threads.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thread</TableHead>
                <TableHead>Identity</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Live</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Loop</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Blocking</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threads.map((t) => (
                <ThreadRow key={t.id} thread={t} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
