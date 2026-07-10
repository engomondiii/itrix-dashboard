import "server-only";

import type { AgentKey } from "@/constants/agentKeys";
import type { ClaimLevel } from "@/constants/claimLevels";
import type { AgentRunRecord } from "@/types/agent";

/** Mock agent-run audit log. Lead ids match `mocks/leads.ts` so links resolve. */
let RUNS: AgentRunRecord[] = [
  {
    id: "run-1",
    agentKey: "diagnosis",
    leadId: "l001",
    status: "delivered",
    usedAi: true,
    governanceStatus: "auto_approved",
    claimLevel: 2,
    durationMs: 1840,
    at: "2026-07-07T09:12:00Z",
  },
  {
    id: "run-2",
    agentKey: "proof",
    leadId: "l001",
    status: "queued",
    usedAi: true,
    governanceStatus: "under_review",
    claimLevel: 3,
    durationMs: 2210,
    at: "2026-07-06T14:20:00Z",
  },
  {
    id: "run-3",
    agentKey: "proposal",
    leadId: "l002",
    status: "queued",
    usedAi: false,
    governanceStatus: "under_review",
    claimLevel: 5,
    durationMs: 990,
    at: "2026-07-06T16:05:00Z",
  },
];

export function listAgentRuns(): AgentRunRecord[] {
  return [...RUNS].sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** Record an agent invocation so the audit log reflects every run. */
export function recordAgentRun(input: {
  agentKey: AgentKey;
  leadId: string | null;
  claimLevel: ClaimLevel;
  governanceStatus: string;
  usedAi: boolean;
}): AgentRunRecord {
  const run: AgentRunRecord = {
    id: `run-${RUNS.length + 1}-${input.agentKey}`,
    agentKey: input.agentKey,
    leadId: input.leadId,
    status: input.governanceStatus === "auto_approved" ? "delivered" : "queued",
    usedAi: input.usedAi,
    governanceStatus: input.governanceStatus,
    claimLevel: input.claimLevel,
    durationMs: 1200 + RUNS.length * 130,
    at: new Date().toISOString(),
  };
  RUNS = [run, ...RUNS];
  return run;
}
