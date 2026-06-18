"use client";

import { use, useState } from "react";
import Link from "next/link";
import { FileSignatureIcon, PencilIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { NDAChecklistDisplay } from "@/components/nda/NDAChecklistDisplay";
import { NDAMarkCompleteButton } from "@/components/nda/NDAMarkCompleteButton";
import { NDASendButton } from "@/components/nda/NDASendButton";
import { NDAActionsMenu } from "@/components/nda/NDAActionsMenu";
import { NdaEditorDialog } from "@/components/nda/NdaEditorDialog";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import { useNdaRecord } from "@/hooks/useNda";
import { NDA_DOC_TYPE_LABELS, type NDAStatus } from "@/types/nda";

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

export default function NDADetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = use(params);
  const { data: nda, isLoading, isError } = useNdaRecord(leadId);
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (isError || !nda) {
    return (
      <EmptyState
        icon={FileSignatureIcon}
        title="NDA not found"
        action={
          <Link href={ROUTES.nda} className="text-sec font-medium text-sapphire-600">
            Back to NDA tracker
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={nda.leadName}
        description="NDA document, status, and signature tracking."
        actions={
          <Link href={ROUTES.lead(nda.leadId)} className="text-sec font-medium text-sapphire-600">
            Open lead
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                {NDA_DOC_TYPE_LABELS[nda.docType]}
                <Badge variant={STATUS_VARIANT[nda.status]}>{nda.status}</Badge>
              </CardTitle>
              {nda.status === "required" && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <PencilIcon />
                  Edit document
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[28rem] overflow-y-auto rounded-md bg-surface-sunken p-4 font-sans text-caption whitespace-pre-wrap text-ink-700">
              {nda.body}
            </pre>
          </CardContent>
        </Card>

        {/* Status + signer + actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NDAChecklistDisplay items={nda.checklist} />
              <dl className="space-y-1 text-caption text-ink-500">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-400">Requested</dt>
                  <dd>{formatDate(nda.requestedAt)}</dd>
                </div>
                {nda.signerName || nda.signerEmail ? (
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-400">Signer</dt>
                    <dd className="text-right">
                      {nda.signerName}
                      {nda.signerName && nda.signerEmail ? " · " : ""}
                      {nda.signerEmail}
                    </dd>
                  </div>
                ) : null}
                {nda.sentAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-400">Sent</dt>
                    <dd>{formatDate(nda.sentAt)}</dd>
                  </div>
                )}
                {nda.signedAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-400">Signed</dt>
                    <dd>{formatDate(nda.signedAt)}</dd>
                  </div>
                )}
              </dl>
              {nda.status === "declined" && nda.declineReason && (
                <p className="text-caption text-error-text">
                  Declined: {nda.declineReason}
                </p>
              )}
            </CardContent>
          </Card>

          {(nda.status === "required" || nda.status === "sent") && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-1.5">
                {nda.status === "required" && <NDASendButton nda={nda} />}
                {nda.status === "sent" && (
                  <NDAMarkCompleteButton leadId={nda.leadId} signed={false} />
                )}
                <NDAActionsMenu leadId={nda.leadId} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {editing && <NdaEditorDialog nda={nda} onClose={() => setEditing(false)} />}
    </>
  );
}
