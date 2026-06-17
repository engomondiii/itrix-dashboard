"use client";

import { use } from "react";
import Link from "next/link";
import { FileSignatureIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { NDAChecklistDisplay } from "@/components/nda/NDAChecklistDisplay";
import { NDAMarkCompleteButton } from "@/components/nda/NDAMarkCompleteButton";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatting";
import { useNdaRecord } from "@/hooks/useNda";

export default function NDADetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = use(params);
  const { data: nda, isLoading, isError } = useNdaRecord(leadId);

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
        description="NDA status and checklist."
        actions={
          <Link href={ROUTES.lead(nda.leadId)} className="text-sec font-medium text-sapphire-600">
            Open lead
          </Link>
        }
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            NDA
            <Badge variant={nda.status === "signed" ? "success" : "warning"}>
              {nda.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-caption text-ink-400">
            {nda.signedAt
              ? `Signed ${formatDate(nda.signedAt)}`
              : `Requested ${formatDate(nda.requestedAt)}`}
          </div>
          <NDAChecklistDisplay items={nda.checklist} />
          <div className="flex justify-end">
            <NDAMarkCompleteButton leadId={nda.leadId} signed={nda.status === "signed"} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
