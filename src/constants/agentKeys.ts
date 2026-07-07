/**
 * Agent vocabulary (Surface 2 v3.0 · Backend v4 §3.3).
 * The nine drafting agents plus the Governance meta-agent, single-sourced with
 * the backend `apps/agents/registry.py`. Wired into the RunAgentMenu / approval
 * queue in Phase 2; declared here as the shared vocabulary.
 */

export const AGENT_KEYS = [
  "concierge",
  "diagnosis",
  "strategy",
  "pitch",
  "buyer",
  "meeting",
  "objection",
  "proof",
  "proposal",
  "governance",
] as const;
export type AgentKey = (typeof AGENT_KEYS)[number];

export const AGENT_LABEL: Record<AgentKey, string> = {
  concierge: "Concierge",
  diagnosis: "Diagnosis",
  strategy: "Strategy",
  pitch: "Pitch",
  buyer: "Buyer",
  meeting: "Meeting",
  objection: "Objection",
  proof: "Proof",
  proposal: "Proposal",
  governance: "Governance",
};

/** The five agents an operator can invoke on demand from a lead (RunAgentMenu). */
export const RUN_AGENT_MENU_KEYS: readonly AgentKey[] = [
  "strategy",
  "buyer",
  "objection",
  "proof",
  "proposal",
];

/** The agent as the visitor/client ever sees it — never a per-agent name. */
export const AGENT_DISPLAY_LABEL = "itriX assessment";
/** A human team member, in a client-facing thread. */
export const TEAM_DISPLAY_LABEL = "itriX team";
