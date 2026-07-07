import type { AgentKey } from "@/constants/agentKeys";
import type { ClaimLevel } from "@/constants/claimLevels";
import type { GovernanceStatus } from "@/constants/governance";

export const APPROVAL_STATUSES = [
  "pending",
  "awaiting_second",
  "approved",
  "rejected",
  "blocked",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** An agent/team draft above the auto-approve threshold, awaiting a human. */
export interface ApprovalRequest {
  id: string;
  leadId: string | null;
  agentKey: AgentKey;
  claimLevel: ClaimLevel;
  draftBody: string;
  finalBody: string;
  citedChunkIds: string[];
  status: ApprovalStatus;
  reason: string;
  requiresSecondApprover: boolean;
  firstApprover: string | null;
  at: string; // ISO
}

/** Result of invoking an agent on demand (`agents/{key}/run/`). */
export interface AgentRunResult {
  agentKey: AgentKey;
  usedAi: boolean;
  governanceStatus: GovernanceStatus | string;
  claimLevel: ClaimLevel;
  output: unknown;
  chunkIds: string[];
}

/** An agent-run audit row (backend `GET agents/runs/`). */
export interface AgentRunRecord {
  id: string;
  agentKey: AgentKey;
  leadId: string | null;
  status: string;
  usedAi: boolean;
  governanceStatus: GovernanceStatus | string;
  claimLevel: ClaimLevel;
  durationMs: number;
  at: string;
}
