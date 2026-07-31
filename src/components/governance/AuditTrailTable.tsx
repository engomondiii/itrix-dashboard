"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { ClaimLevelBadge } from "@/components/agents/ClaimLevelBadge";
import { useGovernanceAudit } from "@/hooks/useClaimCards";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { AGENT_LABEL, type AgentKey } from "@/constants/agentKeys";
import { APPROVAL_STATUSES, type ApprovalRequest, type ApprovalStatus } from "@/types/agent";

function formatAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusVariant(status: string): "success" | "error" | "warning" {
  if (status === "approved" || status === "edited") return "success";
  if (status === "rejected" || status === "blocked") return "error";
  return "warning";
}

type SortKey = "at";

const SORT_ACCESSORS: Record<SortKey, (a: ApprovalRequest) => SortValue> = {
  at: (a) => a.at,
};

export function AuditTrailTable() {
  // Status narrows on the server — the endpoint already accepts `?status=`,
  // so the filter rides the query rather than duplicating it client-side.
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const { data, isLoading, isError } = useGovernanceAudit(status ?? undefined);

  const { search, setSort, sort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<ApprovalRequest, SortKey>({
      items: data,
      searchText: (a) =>
        `${AGENT_LABEL[a.agentKey] ?? a.agentKey} ${a.status} ${a.firstApprover ?? ""} ${a.reason}`,
      sortAccessors: SORT_ACCESSORS,
      initialSort: { key: "at", dir: "desc" },
      filterKey: status ?? "all",
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
        title="Couldn’t load the audit trail"
        description="The governance audit endpoint isn’t available yet."
      />
    );
  }
  if (!data || (data.length === 0 && !status && !search.debounced)) {
    return (
      <EmptyState
        icon={ScrollTextIcon}
        title="No governance records"
        description="Approvals and rejections are recorded here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search agent, approver or reason…"
          wrapperClassName="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={status === null ? "default" : "outline"}
            onClick={() => setStatus(null)}
          >
            All
          </Button>
          {APPROVAL_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {s.replaceAll("_", " ")}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() =>
            setSort({ key: "at", dir: sort.dir === "desc" ? "asc" : "desc" })
          }
        >
          {sort.dir === "desc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No record matches this search or filter (${unfilteredTotal} loaded).`}
        />
      ) : (
        <>
          <div className="space-y-2">
            {pageItems.map((a) => (
              <div key={a.id} className="rounded-md border border-border-soft bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {AGENT_LABEL[a.agentKey as AgentKey] ?? a.agentKey}
                  </Badge>
                  <ClaimLevelBadge level={a.claimLevel} />
                  <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  {a.firstApprover && (
                    <span className="text-caption text-ink-secondary">by {a.firstApprover}</span>
                  )}
                  <div className="ml-auto flex items-center gap-3">
                    {a.conversationId && (
                      <Link
                        href={ROUTES.consoleThread(a.conversationId)}
                        className="text-micro text-ink-primary hover:underline"
                      >
                        Thread
                      </Link>
                    )}
                    {a.leadId && (
                      <Link
                        href={ROUTES.lead(a.leadId)}
                        className="text-micro text-ink-primary hover:underline"
                      >
                        Lead
                      </Link>
                    )}
                    <span className="text-micro text-ink-secondary">{formatAt(a.at)}</span>
                  </div>
                </div>
                {a.reason && (
                  <p className="mt-1 text-caption text-ink-secondary">Reason: {a.reason}</p>
                )}
              </div>
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
