"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ClaimCardEditor } from "@/components/governance/ClaimCardEditor";
import { useClaimCard } from "@/hooks/useClaimCards";
import { ROUTES } from "@/constants/routes";

export default function ClaimCardEditPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useClaimCard(cardId);

  return (
    <>
      <Link
        href={ROUTES.governanceClaimCards}
        className="mb-4 inline-flex items-center gap-1 text-sec text-sapphire-600 hover:underline"
      >
        <ArrowLeftIcon className="size-4" /> Back to claim cards
      </Link>
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="size-5" />
        </div>
      )}
      {(isError || (!isLoading && !data)) && (
        <EmptyState title="Claim card not found" description="It may have been removed." />
      )}
      {data && (
        <ClaimCardEditor
          card={data}
          onDone={() => router.push(ROUTES.governanceClaimCards)}
        />
      )}
    </>
  );
}
