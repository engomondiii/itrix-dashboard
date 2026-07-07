import { Badge } from "@/components/ui/badge";
import { AGENT_LABEL } from "@/constants/agentKeys";
import type { AgentRunResult as AgentRunResultType } from "@/types/agent";

import { ClaimLevelBadge } from "./ClaimLevelBadge";
import { GovernanceStatusPill } from "./GovernanceStatusPill";

export function AgentRunResult({ result }: { result: AgentRunResultType }) {
  const out = (result.output ?? {}) as { summary?: string };
  const summary = out.summary ?? "Draft prepared.";
  const queued =
    result.governanceStatus === "under_review" || result.governanceStatus === "pending";

  return (
    <div className="space-y-2 rounded-md border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{AGENT_LABEL[result.agentKey]}</Badge>
        <ClaimLevelBadge level={result.claimLevel} />
        <GovernanceStatusPill status={result.governanceStatus} />
      </div>
      <p className="text-sec text-ink-700">{summary}</p>
      {queued && (
        <p className="text-caption text-warning-text">
          Queued for approval — clear it in the approvals queue before it reaches the client.
        </p>
      )}
    </div>
  );
}
