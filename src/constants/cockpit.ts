/**
 * Cockpit next-best-action vocabulary (Surface 2 v3.0). The backend returns a
 * deterministic `nextAction` string from JourneyState; these are the operator labels.
 */

import type { JourneyEvent } from "@/constants/journeyStates";

export const NEXT_ACTION_LABEL: Record<string, string> = {
  review: "Wait for a first turn",
  await_diagnosis: "Await diagnosis",
  reveal_client_page: "Deliver the pitch room",
  send_account_invite: "Send account invite",
  await_claim: "Await account creation",
  propose_evaluation: "Propose paid assessment",
  // v5.0: the single `advance_engagement` action split with the ENGAGED state.
  start_poc: "Scope the paid PoC",
  start_integration: "Move to integration",
  record_contract: "Close the license-out agreement",
  review_outcomes: "Review customer outcomes",
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
 * that are waits (`await_diagnosis`, `await_claim`), that happen off-machine
 * (`propose_evaluation`), or that are standing work rather than a transition
 * (`review_outcomes`) have no event and stay advisory.
 */
export const NEXT_ACTION_EVENT: Record<string, JourneyEvent | undefined> = {
  reveal_client_page: "reveal_client_page",
  send_account_invite: "gate_invite",
  start_poc: "poc_start",
  start_integration: "integration_start",
  record_contract: "contract_executed",
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
