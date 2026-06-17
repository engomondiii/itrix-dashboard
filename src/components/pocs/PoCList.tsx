"use client";

import { FlaskConicalIcon } from "lucide-react";

import { PoCCard } from "@/components/pocs/PoCCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { usePoCs } from "@/hooks/useDeals";

export function PoCList() {
  const { data, isLoading } = usePoCs();
  const rows = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={FlaskConicalIcon}
        title="No PoCs in flight"
        description="PoCs appear here once a lead reaches the PoC stage."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((p) => (
        <PoCCard key={p.id} poc={p} />
      ))}
    </div>
  );
}
