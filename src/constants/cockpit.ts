/**
 * Cockpit next-best-action vocabulary (Surface 2 v3.0). The backend returns a
 * deterministic `nextAction` string from JourneyState; these are the operator labels.
 */

export const NEXT_ACTION_LABEL: Record<string, string> = {
  review: "Wait for a prompt",
  await_diagnosis: "Await diagnosis",
  reveal_client_page: "Reveal the client page",
  send_account_invite: "Send account invite",
  await_claim: "Await account creation",
  propose_evaluation: "Propose paid assessment",
  advance_engagement: "Advance the engagement",
  reactivate: "Reactivate (nurture)",
  nurture: "Nurture",
};

export function nextActionLabel(action: string): string {
  return NEXT_ACTION_LABEL[action] ?? action;
}

/** Commercial ladder stages (Review → Assessment → PoC → integration → license-out). */
export const LADDER_STAGES = [
  "Review",
  "Assessment",
  "PoC",
  "Integration",
  "License-out",
] as const;
export type LadderStage = (typeof LADDER_STAGES)[number];
