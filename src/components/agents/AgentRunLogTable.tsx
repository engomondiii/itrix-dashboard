"use client";

import Link from "next/link";
import { HistoryIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAgentRuns } from "@/hooks/useApprovals";
import { AGENT_LABEL, type AgentKey } from "@/constants/agentKeys";
import { ROUTES } from "@/constants/routes";

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

export function AgentRunLogTable() {
  const { data, isLoading, isError } = useAgentRuns();

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
    <div className="space-y-2">
      {data.map((r) => (
        <div key={r.id} className="rounded-md border border-line bg-surface p-3">
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
                className="text-micro text-sapphire-600 hover:underline"
              >
                View lead
              </Link>
            )}
            <span className="ml-auto text-micro text-ink-400">
              {formatDuration(r.durationMs)} · {formatAt(r.at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
