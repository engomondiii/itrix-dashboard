"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { ClaimLevelBadge } from "@/components/agents/ClaimLevelBadge";
import { useAuth } from "@/hooks/useAuth";
import { useClaimCards } from "@/hooks/useClaimCards";
import { useListControls } from "@/hooks/useListControls";
import { CLAIM_LEVELS, type ClaimLevel } from "@/constants/claimLevels";
import { canAdminGovernance } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import type { ClaimCard } from "@/types/claimCard";

import { ClaimCardEditor } from "./ClaimCardEditor";

export function ClaimCardTable() {
  const { user } = useAuth();
  // Level narrows on the server — `useClaimCards(level)` already supports it.
  const [level, setLevel] = useState<ClaimLevel | null>(null);
  const { data, isLoading, isError } = useClaimCards(level ?? undefined);
  const [creating, setCreating] = useState(false);
  const canEdit = canAdminGovernance(user?.role);

  const { search, pageItems, total, unfilteredTotal, pagination } = useListControls<
    ClaimCard,
    never
  >({
    items: data,
    searchText: (c) => `${c.title} ${c.key} ${c.approvedWording}`,
    filterKey: level ?? "all",
  });

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

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search title, key or wording…"
          wrapperClassName="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={level === null ? "default" : "outline"}
            onClick={() => setLevel(null)}
          >
            All levels
          </Button>
          {CLAIM_LEVELS.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={level === l ? "default" : "outline"}
              onClick={() => setLevel(l)}
            >
              L{l}
            </Button>
          ))}
        </div>
      </div>

      {!data || data.length === 0 || total === 0 ? (
        <EmptyState
          icon={BadgeCheckIcon}
          title={data && data.length > 0 ? "No matches" : "No claim cards"}
          description={
            data && data.length > 0
              ? `No card matches this search (${unfilteredTotal} in this view).`
              : "Approved wordings the agents and console are checked against."
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {pageItems.map((c) => (
              <Link
                key={c.id}
                href={ROUTES.governanceClaimCard(c.id)}
                className="block rounded-md border border-border-soft bg-surface p-3 transition-colors hover:border-tint"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sec font-medium text-ink-primary">{c.title}</span>
                  <ClaimLevelBadge level={c.claimLevel} />
                  {!c.isActive && <Badge variant="neutral">Inactive</Badge>}
                  <span className="ml-auto font-mono text-micro text-ink-secondary">{c.key}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-caption text-ink-secondary">
                  {c.approvedWording}
                </p>
              </Link>
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            total={total}
            pageSize={pagination.pageSize}
          />
        </>
      )}
    </div>
  );
}
