import "server-only";

import type { AgentRunRecord } from "@/types/agent";

/** Mock agent-run audit log. (Backend serializer exists but the route is // v3: pending.) */
const RUNS: AgentRunRecord[] = [
  {
    id: "run-1",
    agentKey: "diagnosis",
    leadId: "lead-1",
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
    leadId: "lead-1",
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
    leadId: "lead-2",
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
