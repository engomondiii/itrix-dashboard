import "server-only";

import {
  ALLOWED_TRANSITIONS,
  JOURNEY_PROGRESSION,
  JOURNEY_STATES,
  STATE_REVEAL,
  targetForEvent,
  type JourneyEvent,
  type JourneyState,
} from "@/constants/journeyStates";
import type { LeadStatus } from "@/constants/statuses";
import type {
  JourneyAdvanceResult,
  JourneyLead,
  JourneyOverview,
  JourneyTransition,
} from "@/types/journey";
import { getLead } from "@/mocks/leadsDb";
import { MOCK_LEADS } from "@/mocks/leads";

/**
 * Mock journey store. In mock mode there is no backend state machine, so we
 * synthesize a plausible journey for each existing mock lead (derived from its
 * pipeline status) and let operators advance it in-session. Overrides persist
 * for the life of the process, mirroring the other `*Db` stores.
 */

const overrides = new Map<string, { state: JourneyState; transitions: JourneyTransition[] }>();

/** Map a lead's pipeline status onto a representative journey state. */
const STATUS_TO_STATE: Record<LeadStatus, JourneyState> = {
  New: "IN_REVIEW",
  Contacted: "DIAGNOSED",
  "Meeting Booked": "CLIENT_PAGE",
  NDA: "INVITED",
  Evaluation: "CLIENT",
  PoC: "ENGAGED",
  Licensed: "ENGAGED",
  Closed: "DORMANT",
};

/** The canonical happy-path steps, in order. */
const HAPPY_PATH: ReadonlyArray<{ from: JourneyState; to: JourneyState; event: JourneyEvent }> = [
  { from: "ARRIVED", to: "IN_REVIEW", event: "prompt" },
  { from: "IN_REVIEW", to: "DIAGNOSED", event: "qualify" },
  { from: "DIAGNOSED", to: "CLIENT_PAGE", event: "reveal_client_page" },
  { from: "CLIENT_PAGE", to: "INVITED", event: "gate_invite" },
  { from: "INVITED", to: "CLIENT", event: "accept_invite" },
  { from: "CLIENT", to: "ENGAGED", event: "engage" },
];

function pathTo(target: JourneyState): typeof HAPPY_PATH {
  if (target === "ARRIVED") return [];
  if (target === "DORMANT") {
    return [
      { from: "ARRIVED", to: "IN_REVIEW", event: "prompt" },
      { from: "IN_REVIEW", to: "DIAGNOSED", event: "qualify" },
      { from: "DIAGNOSED", to: "CLIENT_PAGE", event: "reveal_client_page" },
      { from: "CLIENT_PAGE", to: "DORMANT", event: "gate_dormant" },
    ];
  }
  const idx = JOURNEY_PROGRESSION.indexOf(target); // 1..6 for IN_REVIEW..ENGAGED
  return HAPPY_PATH.slice(0, Math.max(idx, 0));
}

function inviteGate(tier: number, specialRights: string): boolean {
  return tier <= 2 || specialRights !== "None";
}

function valueDelivered(state: JourneyState): boolean {
  return state !== "ARRIVED" && state !== "IN_REVIEW";
}

function buildTransitions(leadId: string, target: JourneyState, submittedAt: string): JourneyTransition[] {
  const base = Date.parse(submittedAt) || Date.parse("2026-07-01T09:00:00Z");
  const steps = pathTo(target);
  const rows = steps.map((step, i) => ({
    id: `${leadId}-jt-${i}`,
    fromState: step.from,
    toState: step.to,
    event: step.event,
    reveal: STATE_REVEAL[step.to] ?? "",
    meta: {},
    at: new Date(base + i * 3_600_000).toISOString(),
  }));
  // Backend orders transitions newest-first.
  return rows.reverse();
}

export function getJourney(leadId: string): JourneyLead | null {
  const lead = getLead(leadId);
  if (!lead) return null;

  const override = overrides.get(leadId);
  const state = override?.state ?? STATUS_TO_STATE[lead.status] ?? "ARRIVED";
  const transitions = override?.transitions ?? buildTransitions(leadId, state, lead.submittedAt);

  return {
    leadId,
    state,
    valueDelivered: valueDelivered(state),
    accountInviteAvailable: inviteGate(lead.tier, lead.specialRights),
    transitions,
  };
}

export type AdvanceOutcome =
  | { ok: true; result: JourneyAdvanceResult }
  | { ok: false; status: 404 | 409; detail: string };

export function advanceJourney(leadId: string, event: JourneyEvent): AdvanceOutcome {
  const journey = getJourney(leadId);
  if (!journey) return { ok: false, status: 404, detail: "Not found" };

  const from = journey.state;
  const to = targetForEvent(from, event);
  if (!to) {
    return {
      ok: false,
      status: 409,
      detail: `Event '${event}' is not allowed from state '${from}'.`,
    };
  }

  const transition: JourneyTransition = {
    id: `${leadId}-jt-${journey.transitions.length}`,
    fromState: from,
    toState: to,
    event,
    reveal: STATE_REVEAL[to] ?? "",
    meta: {},
    at: new Date().toISOString(),
  };
  overrides.set(leadId, { state: to, transitions: [transition, ...journey.transitions] });

  return {
    ok: true,
    result: {
      leadId,
      fromState: from,
      toState: to,
      event,
      changed: true,
      reveal: STATE_REVEAL[to] ? { surface: STATE_REVEAL[to] } : null,
    },
  };
}

/** Valid events an operator could fire from the lead's current state (for the mock UI). */
export function validEventsFor(leadId: string): JourneyEvent[] {
  const journey = getJourney(leadId);
  if (!journey) return [];
  return Object.keys(ALLOWED_TRANSITIONS[journey.state] ?? {}) as JourneyEvent[];
}

/** Distribution of all leads across journey states (overview widget). */
export function getStateDistribution(): JourneyOverview {
  const distribution = Object.fromEntries(
    JOURNEY_STATES.map((s) => [s, 0]),
  ) as Record<JourneyState, number>;
  for (const lead of MOCK_LEADS) {
    const journey = getJourney(lead.id);
    const state = journey?.state ?? "ARRIVED";
    distribution[state] += 1;
  }
  return { distribution, total: MOCK_LEADS.length };
}
