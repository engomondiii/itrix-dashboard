"use client";

import Link from "next/link";
import { useState } from "react";
import { LockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { useAttachmentDetail } from "@/hooks/useAttachments";
import { useAuth } from "@/hooks/useAuth";
import { canAdminGovernance } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatDateTime } from "@/lib/formatting";

import { AttachmentAuditTrail } from "./AttachmentAuditTrail";
import { ExtractionSummary } from "./ExtractionSummary";
import { QuarantineDialog } from "./QuarantineDialog";
import { ReleaseDialog } from "./ReleaseDialog";
import { RiskFlagList } from "./RiskFlagList";
import { ScanStatusBadge } from "./ScanStatusBadge";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
        {label}
      </div>
      <div className="text-sec text-ink-primary">{children}</div>
    </div>
  );
}

/**
 * One attachment: scan, extraction, retention and the full audit trail.
 *
 * TWO RULES ARE ENFORCED VISUALLY HERE, not just in copy:
 *
 *   · A QUARANTINED FILE HAS NO DOWNLOAD CONTROL AT ALL. Not disabled — absent.
 *     A disabled button is an invitation to find the enabled path; there isn't
 *     one, and the UI should not imply there might be.
 *   · DOWNLOADING IS AUDITED AND SAYS SO BEFORE IT HAPPENS. The warning is
 *     attached to the control rather than buried in a policy page, because the
 *     moment of decision is the only place it changes behaviour.
 */
export function AttachmentDetailView({ attachmentId }: { attachmentId: string }) {
  const query = useAttachmentDetail(attachmentId);
  const { user } = useAuth();
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [quarantineOpen, setQuarantineOpen] = useState(false);

  const attachment = query.data;
  const mayDecide = canAdminGovernance(user?.role);
  const quarantined = attachment?.status === "quarantined";

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(attachment)}
        label="this attachment"
      />

      {attachment && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{attachment.filename}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ScanStatusBadge verdict={attachment.scan.verdict} />
                {quarantined && <Badge variant="error">Quarantined</Badge>}
                {attachment.preNda && <Badge variant="warning">Pre-NDA handling</Badge>}
                <Badge variant="neutral">{attachment.identityState}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Thread">
                  <Link
                    href={ROUTES.thread(attachment.threadId)}
                    className="hover:underline"
                  >
                    {attachment.threadTitle}
                  </Link>
                </Field>
                <Field label="Uploaded">{formatDateTime(attachment.createdAt)}</Field>
                <Field label="Extraction">
                  <ExtractionSummary extraction={attachment.extraction} />
                </Field>
                <Field label="Retention">
                  {attachment.retentionExpiresAt ? (
                    <>
                      Purges {formatDate(attachment.retentionExpiresAt)}
                      <p className="text-caption text-ink-secondary">
                        Pre-NDA uploads carry a shortened window, encryption at rest and
                        thread-scoped access.
                      </p>
                    </>
                  ) : (
                    "Follows the client’s contractual retention."
                  )}
                </Field>
                <Field label="SHA-256">
                  <code className="font-mono text-micro break-all text-ink-secondary">
                    {attachment.sha256}
                  </code>
                </Field>
                <Field label="Risk flags">
                  <RiskFlagList flags={attachment.riskFlags} />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border-soft pt-3">
                {quarantined ? (
                  <>
                    <span className="flex items-center gap-1.5 text-caption text-ink-secondary">
                      <LockIcon className="size-3.5" aria-hidden="true" />
                      Quarantined files cannot be previewed or downloaded. Release first.
                    </span>
                    {mayDecide && (
                      <Button size="sm" onClick={() => setReleaseOpen(true)}>
                        Release…
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" disabled>
                      Download (audited)
                    </Button>
                    <span className="text-caption text-ink-secondary">
                      Downloading is logged with your name, the thread and the purpose.
                    </span>
                    {mayDecide && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setQuarantineOpen(true)}
                      >
                        Quarantine…
                      </Button>
                    )}
                  </>
                )}
                {!mayDecide && (
                  <span className="text-caption text-ink-secondary">
                    Quarantine and release are restricted to Admin / Assessment Team.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentAuditTrail entries={attachment.audit} />
            </CardContent>
          </Card>

          <ReleaseDialog
            attachmentId={attachment.id}
            filename={attachment.filename}
            open={releaseOpen}
            onOpenChange={setReleaseOpen}
          />
          <QuarantineDialog
            attachmentId={attachment.id}
            filename={attachment.filename}
            open={quarantineOpen}
            onOpenChange={setQuarantineOpen}
          />
        </>
      )}
    </div>
  );
}
