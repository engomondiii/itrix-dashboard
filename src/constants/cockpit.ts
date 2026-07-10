/**
 * Cockpit next-best-action vocabulary (Surface 2 v3.0). The backend returns a
 * deterministic `nextAction` string from JourneyState; these are the operator labels.
 */

import type { JourneyEvent } from "@/constants/journeyStates";

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

/**
 * The journey event that performs a next-best-action, where one exists.
 *
 * The two vocabularies deliberately differ (the cockpit speaks in operator intent,
 * the journey machine in state transitions), so the mapping is explicit. Actions
 * that are waits (`await_diagnosis`, `await_claim`) or that happen off-machine
 * (`propose_evaluation`) have no event and stay advisory.
 */
export const NEXT_ACTION_EVENT: Record<string, JourneyEvent | undefined> = {
  reveal_client_page: "reveal_client_page",
  send_account_invite: "gate_invite",
  advance_engagement: "engage",
  reactivate: "reactivate",
  nurture: "gate_dormant",
};

export function eventForNextAction(action: string): JourneyEvent | undefined {
  return NEXT_ACTION_EVENT[action];
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
