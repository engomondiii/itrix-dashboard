"use client";

import Link from "next/link";
import { ScrollTextIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ClaimLevelBadge } from "@/components/agents/ClaimLevelBadge";
import { useGovernanceAudit } from "@/hooks/useClaimCards";
import { AGENT_LABEL, type AgentKey } from "@/constants/agentKeys";

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

export function AuditTrailTable() {
  const { data, isLoading, isError } = useGovernanceAudit();

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
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ScrollTextIcon}
        title="No governance records"
        description="Approvals and rejections are recorded here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {data.map((a) => (
        <div key={a.id} className="rounded-md border border-line bg-surface p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">
              {AGENT_LABEL[a.agentKey as AgentKey] ?? a.agentKey}
            </Badge>
            <ClaimLevelBadge level={a.claimLevel} />
            <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
            {a.firstApprover && (
              <span className="text-caption text-ink-500">by {a.firstApprover}</span>
            )}
            <div className="ml-auto flex items-center gap-3">
              {a.conversationId && (
                <Link
                  href={ROUTES.consoleThread(a.conversationId)}
                  className="text-micro text-sapphire-600 hover:underline"
                >
                  Thread
                </Link>
              )}
              {a.leadId && (
                <Link
                  href={ROUTES.lead(a.leadId)}
                  className="text-micro text-sapphire-600 hover:underline"
                >
                  Lead
                </Link>
              )}
              <span className="text-micro text-ink-400">{formatAt(a.at)}</span>
            </div>
          </div>
          {a.reason && (
            <p className="mt-1 text-caption text-ink-500">Reason: {a.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
