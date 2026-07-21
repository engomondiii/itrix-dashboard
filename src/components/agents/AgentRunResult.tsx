import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { AGENT_LABEL } from "@/constants/agentKeys";
import { ROUTES } from "@/constants/routes";
import type { AgentRunResult as AgentRunResultType } from "@/types/agent";

import { ClaimLevelBadge } from "./ClaimLevelBadge";
import { GovernanceStatusPill } from "./GovernanceStatusPill";

export function AgentRunResult({ result }: { result: AgentRunResultType }) {
  const out = (result.output ?? {}) as { summary?: string };
  const summary = out.summary ?? "Draft prepared.";
  const queued =
    result.governanceStatus === "under_review" || result.governanceStatus === "pending";

  return (
    <div className="space-y-2 rounded-md border border-border-soft bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{AGENT_LABEL[result.agentKey]}</Badge>
        <ClaimLevelBadge level={result.claimLevel} />
        <GovernanceStatusPill status={result.governanceStatus} />
      </div>
      <p className="text-sec text-ink-secondary">{summary}</p>
      {queued ? (
        <p className="text-caption text-warning-text">
          Queued for approval — it reaches the client only once cleared in the{" "}
          <Link href={ROUTES.agentApprovals} className="font-medium underline">
            approvals queue
          </Link>
          .
        </p>
      ) : (
        <p className="text-caption text-ink-secondary">
          Auto-approved — delivered without human review. See the{" "}
          <Link href={ROUTES.agentRuns} className="font-medium underline">
            agent run log
          </Link>
          .
        </p>
      )}
    </div>
  );
}
