"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAttachmentQueue } from "@/hooks/useAttachments";
import { useSLATimer } from "@/hooks/useSLATimer";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import type { AttachmentListItem } from "@/types/attachment";

import { ExtractionSummary } from "./ExtractionSummary";
import { ScanStatusBadge } from "./ScanStatusBadge";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * How long until a pre-NDA file purges.
 *
 * Shown prominently and in days, "so nobody is surprised when it purges"
 * (Surface 2 v5.0 §4.2). A file about to expire is a prompt to act — either
 * finish the NDA or accept that the material goes.
 */
function RetentionCell({ attachment }: { attachment: AttachmentListItem }) {
  // A ticking `now` from the shared timer rather than `Date.now()` in render:
  // reading the clock during render is impure, and a countdown that only moves
  // when something else happens to re-render is worse than no countdown.
  const now = useSLATimer();

  if (!attachment.preNda || !attachment.retentionExpiresAt) {
    return <span className="text-micro text-ink-muted">—</span>;
  }
  const days = Math.ceil((Date.parse(attachment.retentionExpiresAt) - now) / 86_400_000);
  return (
    <span className="flex flex-col gap-0.5">
      <Badge variant={days <= 7 ? "warning" : "neutral"}>
        {days <= 0 ? "Purging" : `${days}d left`}
      </Badge>
      <span className="text-micro text-ink-secondary">
        {formatDate(attachment.retentionExpiresAt)}
      </span>
    </span>
  );
}

/**
 * Everything visitors have uploaded, worst first.
 *
 * A quarantined file is never previewable and never downloadable from here —
 * there is deliberately no download control on a quarantined row. Release is
 * the only route, and it is a logged decision with a reason.
 */
export function AttachmentQueue() {
  const [quarantinedOnly, setQuarantinedOnly] = useState(false);
  const [preNdaOnly, setPreNdaOnly] = useState(false);
  const query = useAttachmentQueue({
    quarantinedOnly: quarantinedOnly || undefined,
    preNdaOnly: preNdaOnly || undefined,
  });
  const rows = query.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={quarantinedOnly ? "default" : "outline"}
          aria-pressed={quarantinedOnly}
          onClick={() => setQuarantinedOnly((v) => !v)}
        >
          Quarantined only
        </Button>
        <Button
          size="sm"
          variant={preNdaOnly ? "default" : "outline"}
          aria-pressed={preNdaOnly}
          onClick={() => setPreNdaOnly((v) => !v)}
        >
          Pre-NDA only
        </Button>
      </div>

      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(rows)}
        label="the attachment queue"
        error={query.error}
      />

      {rows && rows.length === 0 && (
        <EmptyState
          title="Nothing to review"
          description="No attachments match. Uploads appear here as soon as they are scanned."
        />
      )}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Thread</TableHead>
                <TableHead>Scan</TableHead>
                <TableHead>Extraction</TableHead>
                <TableHead>Pre-NDA</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.attachment(a.id)}
                      className="font-medium text-ink-primary hover:underline"
                    >
                      {a.filename}
                    </Link>
                    <div className="text-micro text-ink-secondary">
                      {formatBytes(a.bytes)} · {a.detectedMime}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[22ch]">
                    <Link
                      href={ROUTES.thread(a.threadId)}
                      className="line-clamp-1 text-sec text-ink-secondary hover:underline"
                    >
                      {a.threadTitle}
                    </Link>
                    <div className="text-micro text-ink-secondary">{a.identityState}</div>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-col items-start gap-1">
                      <ScanStatusBadge verdict={a.scan.verdict} />
                      {a.status === "quarantined" && (
                        <Badge variant="error">Quarantined</Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ExtractionSummary extraction={a.extraction} />
                  </TableCell>
                  <TableCell>
                    <RetentionCell attachment={a} />
                  </TableCell>
                  <TableCell className="tabular-nums text-sec text-ink-secondary">
                    {a.riskFlags.length === 0 ? (
                      <span className="text-ink-muted">—</span>
                    ) : (
                      <Badge variant="warning">{a.riskFlags.length}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
