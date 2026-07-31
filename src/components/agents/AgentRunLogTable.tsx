"use client";

import Link from "next/link";
import { useState } from "react";
import { HistoryIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAgentRuns } from "@/hooks/useApprovals";
import { useListControls, type SortValue } from "@/hooks/useListControls";
import { AGENT_KEYS, AGENT_LABEL, type AgentKey } from "@/constants/agentKeys";
import { ROUTES } from "@/constants/routes";
import type { AgentRunRecord } from "@/types/agent";

import { ClaimLevelBadge } from "./ClaimLevelBadge";
import { GovernanceStatusPill } from "./GovernanceStatusPill";

function formatAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Runs take seconds, not milliseconds — show a figure a human can read. */
function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(1)} s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

type SortKey = "at" | "duration";

const SORT_OPTIONS: Record<string, { key: SortKey; dir: "asc" | "desc"; label: string }> = {
  newest: { key: "at", dir: "desc", label: "Newest first" },
  oldest: { key: "at", dir: "asc", label: "Oldest first" },
  slowest: { key: "duration", dir: "desc", label: "Slowest first" },
  fastest: { key: "duration", dir: "asc", label: "Fastest first" },
};

const SORT_ACCESSORS: Record<SortKey, (r: AgentRunRecord) => SortValue> = {
  at: (r) => r.at,
  duration: (r) => r.durationMs,
};

const ALL_AGENTS = "__all__";

export function AgentRunLogTable() {
  const { data, isLoading, isError } = useAgentRuns();

  const [agent, setAgent] = useState<AgentKey | null>(null);
  const [sortOption, setSortOption] = useState("newest");

  const { search, setSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<AgentRunRecord, SortKey>({
      items: data,
      searchText: (r) =>
        `${AGENT_LABEL[r.agentKey as AgentKey] ?? r.agentKey} ${r.governanceStatus} ${r.status} ${r.leadId ?? ""}`,
      sortAccessors: SORT_ACCESSORS,
      initialSort: { key: "at", dir: "desc" },
      filter: agent ? (r) => r.agentKey === agent : undefined,
      filterKey: agent ?? "all",
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
        title="Couldn’t load agent runs"
        description="The agent-run audit endpoint isn’t available yet."
      />
    );
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No agent runs"
        description="Agent invocations are logged here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search agent, status or lead…"
          wrapperClassName="w-full sm:w-72"
        />
        <Select
          value={agent ?? ALL_AGENTS}
          onValueChange={(v) => setAgent(v === ALL_AGENTS ? null : (v as AgentKey))}
        >
          <SelectTrigger size="sm">
            <SelectValue>
              {(v) =>
                v === ALL_AGENTS ? "All agents" : (AGENT_LABEL[v as AgentKey] ?? String(v))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_AGENTS}>All agents</SelectItem>
            {AGENT_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {AGENT_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOption}
          onValueChange={(v) => {
            const next = SORT_OPTIONS[String(v)];
            if (!next) return;
            setSortOption(String(v));
            setSort({ key: next.key, dir: next.dir });
          }}
        >
          <SelectTrigger size="sm" className="ml-auto">
            <SelectValue>{(v) => `Sort: ${SORT_OPTIONS[String(v)]?.label ?? ""}`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([value, opt]) => (
              <SelectItem key={value} value={value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No run matches this search or filter (${unfilteredTotal} logged).`}
        />
      ) : (
        <>
          <div className="space-y-2">
            {pageItems.map((r) => (
              <div key={r.id} className="rounded-md border border-border-soft bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {AGENT_LABEL[r.agentKey as AgentKey] ?? r.agentKey}
                  </Badge>
                  <ClaimLevelBadge level={r.claimLevel} />
                  <GovernanceStatusPill status={r.governanceStatus} />
                  <Badge variant={r.usedAi ? "info" : "neutral"}>
                    {r.usedAi ? "AI" : "Deterministic"}
                  </Badge>
                  {r.leadId && (
                    <Link
                      href={ROUTES.lead(r.leadId)}
                      className="text-micro text-ink-primary hover:underline"
                    >
                      View lead
                    </Link>
                  )}
                  <span className="ml-auto text-micro text-ink-secondary">
                    {formatDuration(r.durationMs)} · {formatAt(r.at)}
                  </span>
                </div>
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
