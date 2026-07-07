"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ClaimLevelBadge } from "@/components/agents/ClaimLevelBadge";
import { useAuth } from "@/hooks/useAuth";
import { useClaimCards } from "@/hooks/useClaimCards";
import { canAdminGovernance } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";

import { ClaimCardEditor } from "./ClaimCardEditor";

export function ClaimCardTable() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useClaimCards();
  const [creating, setCreating] = useState(false);
  const canEdit = canAdminGovernance(user?.role);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load claim cards"
        description="The governance endpoint isn’t available yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {canEdit &&
        (creating ? (
          <ClaimCardEditor onDone={() => setCreating(false)} />
        ) : (
          <Button size="sm" onClick={() => setCreating(true)}>
            New claim card
          </Button>
        ))}

      {!data || data.length === 0 ? (
        <EmptyState
          icon={BadgeCheckIcon}
          title="No claim cards"
          description="Approved wordings the agents and console are checked against."
        />
      ) : (
        <div className="space-y-2">
          {data.map((c) => (
            <Link
              key={c.id}
              href={ROUTES.governanceClaimCard(c.id)}
              className="block rounded-md border border-line bg-surface p-3 transition-colors hover:border-sapphire-300"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sec font-medium text-ink-900">{c.title}</span>
                <ClaimLevelBadge level={c.claimLevel} />
                {!c.isActive && <Badge variant="neutral">Inactive</Badge>}
                <span className="ml-auto font-mono text-micro text-ink-400">{c.key}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-caption text-ink-500">
                {c.approvedWording}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
