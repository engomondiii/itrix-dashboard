"use client";

import { use } from "react";
import Link from "next/link";
import { FlaskConicalIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PoCDetailPanel } from "@/components/pocs/PoCDetailPanel";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { usePoC } from "@/hooks/useDeals";

export default function PoCDetailPage({
  params,
}: {
  params: Promise<{ pocId: string }>;
}) {
  const { pocId } = use(params);
  const { data: poc, isLoading, isError } = usePoC(pocId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !poc) {
    return (
      <EmptyState
        icon={FlaskConicalIcon}
        title="PoC not found"
        action={
          <Link href={ROUTES.pocs} className="text-sec font-medium text-sapphire-600">
            Back to PoCs
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={poc.leadName}
        description="Proof-of-concept tracker."
        actions={
          <Link href={ROUTES.pocs} className="text-sec font-medium text-sapphire-600">
            All PoCs
          </Link>
        }
      />
      <PoCDetailPanel poc={poc} />
    </>
  );
}
