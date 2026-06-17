"use client";

import { FileSignatureIcon } from "lucide-react";

import { NDAStatusCard } from "@/components/nda/NDAStatusCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useNdaQueue } from "@/hooks/useNda";

export function NDAQueue() {
  const { data, isLoading } = useNdaQueue();
  const records = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={FileSignatureIcon}
        title="No NDAs in progress"
        description="NDAs appear here once a lead reaches the NDA stage."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {records.map((nda) => (
        <NDAStatusCard key={nda.id} nda={nda} />
      ))}
    </div>
  );
}
