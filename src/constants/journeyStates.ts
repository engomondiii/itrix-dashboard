/**
 * The ten-state journey vocabulary (Surface 2 v5.0 §00.1, Architecture v2.6
 * §11.1, Backend v6.0 §3).
 *
 * Single-sourced with the backend `apps/journey/constants.py` and mirrored —
 * never re-decided — in both frontends. State lives on the backend and is
 * authoritative; this surface reads it and requests guarded advances through
 * `POST journey/leads/{id}/advance/`. Journey state has exactly one writer.
 *
 * WHAT CHANGED FROM v3.0
 * ---------------------------------------------------------------------------
 * The eight states became ten. The single terminal `ENGAGED` state carried
 * three commercially distinct situations at once — a paid Assessment, a paid
 * PoC, and an integration heading for license-out — so a lead sat in it for
 * months and the monitor could not say which. It splits into ASSESSMENT (7),
 * POC (8) and INTEGRATION (9), and CUSTOMER_SUCCESS (10) is added beyond them.
 * `CLIENT` becomes `NDA_REVIEW`, which is what that state always meant.
 *
 * Both retired values are still accepted on the wire for one release (see
 * `normalizeState`), because the backend keeps them as deprecated aliases
 * through its own Phase 1 and the data migration is reviewed before it runs.
 *
 * DORMANT is retained as an OFF-LADDER state. It has no journey number, and it
 * is deliberately not in `JOURNEY_PROGRESSION` — a lead in nurture has not
 * reached a rung, it has stepped off the ladder.
 */

/** The ten numbered states, in order, plus the off-ladder DORMANT. */
export const JOURNEY_STATES = [
  "ARRIVED",
  "IN_REVIEW",
  "DIAGNOSED",
  "CLIENT_PAGE",
  "INVITED",
  "NDA_REVIEW",
  "ASSESSMENT",
  "POC",
  "INTEGRATION",
  "CUSTOMER_SUCCESS",
  "DORMANT",
] as const;
export type JourneyState = (typeof JOURNEY_STATES)[number];

/** The numbered ladder, 1–10 (excludes DORMANT) — used for progress and order. */
export const JOURNEY_PROGRESSION: readonly JourneyState[] = [
  "ARRIVED",
  "IN_REVIEW",
  "DIAGNOSED",
  "CLIENT_PAGE",
  "INVITED",
  "NDA_REVIEW",
  "ASSESSMENT",
  "POC",
  "INTEGRATION",
  "CUSTOMER_SUCCESS",
];

/** `journey_number` — the 1–10 the backend sends. DORMANT has none. */
export const JOURNEY_NUMBER: Record<JourneyState, number | null> = {
  ARRIVED: 1,
  IN_REVIEW: 2,
  DIAGNOSED: 3,
  CLIENT_PAGE: 4,
  INVITED: 5,
  NDA_REVIEW: 6,
  ASSESSMENT: 7,
  POC: 8,
  INTEGRATION: 9,
  CUSTOMER_SUCCESS: 10,
  DORMANT: null,
};

/**
 * `state_key` — the stable string form shared with Surface 1. Mirrored from
 * itrix-web `src/lib/journey/journeyStates.ts` so the two surfaces name the
 * same state identically in payloads, telemetry and logs.
 */
export const STATE_KEY = {
  ARRIVED: "arrival",
  IN_REVIEW: "listening",
  DIAGNOSED: "reflection",
  CLIENT_PAGE: "pitch-room",
  INVITED: "qualified",
  NDA_REVIEW: "nda",
  ASSESSMENT: "assessment",
  POC: "poc",
  INTEGRATION: "integration",
  CUSTOMER_SUCCESS: "customer-success",
  DORMANT: "dormant",
} as const satisfies Record<JourneyState, string>;
export type StateKey = (typeof STATE_KEY)[JourneyState];

/**
 * Operator-facing labels.
 *
 * These are internal — this is the team plane. The visitor-facing chip labels
 * are different and deliberately never numbered (Playbook v1.6 §16E); they are
 * not defined here because this surface never renders to a visitor.
 */
export const JOURNEY_STATE_LABEL: Record<JourneyState, string> = {
  ARRIVED: "Arrived",
  IN_REVIEW: "In review",
  DIAGNOSED: "Diagnosed",
  CLIENT_PAGE: "Client page",
  INVITED: "Invited",
  NDA_REVIEW: "NDA review",
  ASSESSMENT: "Assessment",
  POC: "PoC",
  INTEGRATION: "Integration",
  CUSTOMER_SUCCESS: "Customer success",
  DORMANT: "Dormant",
};

/** One-line description of what each state means for the operator. */
export const JOURNEY_STATE_DESCRIPTION: Record<JourneyState, string> = {
  ARRIVED: "Anonymous visitor, empty thread.",
  IN_REVIEW: "Listening and clarification — the question loop is running.",
  DIAGNOSED: "Reflection artifact delivered. Value delivered (reveal ①).",
  CLIENT_PAGE: "Personalized pitch room delivered in-thread.",
  INVITED: "Passed the gate — account creation unlocked (reveal ②).",
  NDA_REVIEW: "Account created; NDA and confidential review (reveals ③④).",
  ASSESSMENT: "Paid Alpha Compute Assessment — success overlay active (reveal ⑤).",
  POC: "Paid proof of concept against agreed KPIs.",
  INTEGRATION: "Integration and license-out decisions.",
  CUSTOMER_SUCCESS: "Contract executed — value realization (reveal ⑥).",
  DORMANT: "Nurture — inactive, or below the invite gate.",
};

type BadgeIntent = "info" | "warning" | "success" | "neutral" | "signature" | "error";

export const JOURNEY_STATE_INTENT: Record<JourneyState, BadgeIntent> = {
  ARRIVED: "neutral",
  IN_REVIEW: "info",
  DIAGNOSED: "info",
  CLIENT_PAGE: "info",
  INVITED: "warning",
  NDA_REVIEW: "success",
  ASSESSMENT: "signature",
  POC: "signature",
  INTEGRATION: "signature",
  CUSTOMER_SUCCESS: "success",
  DORMANT: "neutral",
};

/**
 * The events that drive transitions (`advance(subject, event)`).
 *
 * v2.6 makes transitions CONVERSATION-driven rather than route-driven: the
 * platform advances because a turn was posted or the question loop closed, not
 * because the visitor arrived at a page. `first_turn` and `loop_closed` are
 * those two entry points; the commercial events below are recorded by the team.
 */
export const JOURNEY_EVENTS = [
  "first_turn",
  "loop_closed",
  "reveal_client_page",
  "gate_invite",
  "gate_dormant",
  "accept_invite",
  "nda_signed",
  "first_payment",
  "poc_start",
  "integration_start",
  "contract_executed",
  "reactivate",
] as const;
export type JourneyEvent = (typeof JOURNEY_EVENTS)[number];

/** Operator-facing labels for a manual advance action. */
export const JOURNEY_EVENT_LABEL: Record<JourneyEvent, string> = {
  first_turn: "Mark first turn posted",
  loop_closed: "Close the question loop",
  reveal_client_page: "Deliver the pitch room",
  gate_invite: "Pass invite gate",
  gate_dormant: "Move to nurture",
  accept_invite: "Mark invite accepted",
  nda_signed: "Record NDA signed",
  first_payment: "Record first payment",
  poc_start: "Start PoC",
  integration_start: "Start integration",
  contract_executed: "Record contract executed",
  reactivate: "Reactivate",
};

/**
 * The six gated reveals (Architecture v2.6 §11.5).
 *
 * v3.0 had four. Reveals ⑤ and ⑥ are new: the customer-success overlay
 * activates at the FIRST PAYMENT rather than at license-out, and the success
 * home follows contract execution.
 *
 * A reveal no longer unlocks a page the visitor is sent to — it appends an
 * artifact or a card to the open thread. The vocabulary is unchanged by that;
 * only what Surface 1 does with it is.
 */
export const REVEAL_SURFACES = [
  "client_page",
  "account_invite",
  "portal",
  "data_room",
  "success_overlay",
  "success_home",
] as const;
export type RevealSurface = (typeof REVEAL_SURFACES)[number];

export const REVEAL_SURFACE_LABEL: Record<RevealSurface, string> = {
  client_page: "Client page",
  account_invite: "Account invite",
  portal: "Client portal",
  data_room: "NDA data room",
  success_overlay: "Success overlay",
  success_home: "Customer-success home",
};

/** ①–⑥ ordinal shown against each reveal. */
export const REVEAL_ORDINAL: Record<RevealSurface, string> = {
  client_page: "①",
  account_invite: "②",
  portal: "③",
  data_room: "④",
  success_overlay: "⑤",
  success_home: "⑥",
};

/**
 * The authoritative transition table `{from: {event: to}}` — mirrors the
 * backend `ALLOWED_TRANSITIONS`. Used to offer only valid manual advances.
 *
 * `nda_signed` is a SELF-transition on NDA_REVIEW. Reveal ④ raises the
 * disclosure ceiling and makes document artifacts fetchable without moving the
 * subject to a new state, so the event has to be expressible without a state
 * change — see `advanceChangesState`.
 */
export const ALLOWED_TRANSITIONS: Record<
  JourneyState,
  Partial<Record<JourneyEvent, JourneyState>>
> = {
  ARRIVED: { first_turn: "IN_REVIEW", loop_closed: "DIAGNOSED" },
  IN_REVIEW: { loop_closed: "DIAGNOSED" },
  DIAGNOSED: { reveal_client_page: "CLIENT_PAGE" },
  CLIENT_PAGE: { gate_invite: "INVITED", gate_dormant: "DORMANT" },
  INVITED: { accept_invite: "NDA_REVIEW", gate_dormant: "DORMANT" },
  NDA_REVIEW: {
    nda_signed: "NDA_REVIEW",
    first_payment: "ASSESSMENT",
    gate_dormant: "DORMANT",
  },
  ASSESSMENT: { poc_start: "POC", gate_dormant: "DORMANT" },
  POC: { integration_start: "INTEGRATION", gate_dormant: "DORMANT" },
  INTEGRATION: { contract_executed: "CUSTOMER_SUCCESS", gate_dormant: "DORMANT" },
  CUSTOMER_SUCCESS: {},
  DORMANT: { reactivate: "CLIENT_PAGE" },
};

/** Which reveal (if any) ARRIVING at a state unlocks — mirrors backend STATE_REVEAL. */
export const STATE_REVEAL: Partial<Record<JourneyState, RevealSurface>> = {
  DIAGNOSED: "client_page",
  INVITED: "account_invite",
  NDA_REVIEW: "portal",
  ASSESSMENT: "success_overlay",
  CUSTOMER_SUCCESS: "success_home",
};

/**
 * Reveals fired by an EVENT rather than by arriving somewhere. Reveal ④ is the
 * only one: signing the NDA raises the ceiling in place.
 */
export const EVENT_REVEAL: Partial<Record<JourneyEvent, RevealSurface>> = {
  nda_signed: "data_room",
};

/**
 * v3.0 wire values → their current equivalents.
 *
 * The backend emits these as deprecated aliases for one release while the
 * ENGAGED split migration is reviewed and applied. Mirrors the same table in
 * itrix-web so a lead cannot read as one state on Surface 1 and another here.
 */
const LEGACY_STATES: Record<string, JourneyState> = {
  CLIENT: "NDA_REVIEW",
  ENGAGED: "ASSESSMENT",
};

const KNOWN_STATES: ReadonlySet<string> = new Set(JOURNEY_STATES);

/**
 * Accept any state the backend sends — current, legacy or unknown — and return
 * something safe.
 *
 * An UNKNOWN state resolves to ARRIVED, the most restrictive state there is.
 * That is deliberate: if the two vocabularies ever drift, the failure mode must
 * be "the operator sees a lead as less progressed than it is", never "a lead
 * appears to have cleared a gate it has not".
 */
export function normalizeState(raw: string | null | undefined): JourneyState {
  if (!raw) return "ARRIVED";
  if (KNOWN_STATES.has(raw)) return raw as JourneyState;
  const legacy = LEGACY_STATES[raw];
  if (legacy) return legacy;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[journey] Unknown state "${raw}" — falling back to ARRIVED (most restrictive). ` +
        "This vocabulary has drifted from apps/journey/constants.py.",
    );
  }
  return "ARRIVED";
}

/** True if the wire value is one of the two retired v3.0 names. */
export function isLegacyState(raw: string): boolean {
  return raw in LEGACY_STATES;
}

/** The events valid from a given state (keys of that state's transition map). */
export function eventsFromState(state: JourneyState): JourneyEvent[] {
  return Object.keys(ALLOWED_TRANSITIONS[state] ?? {}) as JourneyEvent[];
}

/** The target state a given event would move to from `state`, or null if invalid. */
export function targetForEvent(
  state: JourneyState,
  event: JourneyEvent,
): JourneyState | null {
  return ALLOWED_TRANSITIONS[state]?.[event] ?? null;
}

/** False for a self-transition such as `nda_signed`, which reveals in place. */
export function advanceChangesState(from: JourneyState, to: JourneyState): boolean {
  return from !== to;
}

/** Progress index on the numbered ladder (DORMANT resolves to -1). */
export function progressionIndex(state: JourneyState): number {
  return JOURNEY_PROGRESSION.indexOf(state);
}

/** The 1–10 number, or null for DORMANT. */
export function journeyNumber(state: JourneyState | null | undefined): number | null {
  if (!state) return null;
  return JOURNEY_NUMBER[state] ?? null;
}

export function stateKey(state: JourneyState | null | undefined): StateKey {
  if (!state) return "arrival";
  return STATE_KEY[state] ?? "arrival";
}

/** True if `state` has reached at least `target` on the numbered ladder. */
export function hasReached(state: JourneyState, target: JourneyState): boolean {
  const a = progressionIndex(state);
  const b = progressionIndex(target);
  if (a === -1 || b === -1) return false; // DORMANT reaches nothing
  return a >= b;
}

/**
 * A workspace state (7–10). The customer-success overlay activates HERE, at the
 * first payment — not at license-out (Architecture v2.6 §7.1). A paid
 * Assessment customer already has named owners, support access and success
 * goals, and the cockpit must show them as a customer from this point.
 */
export function isWorkspaceState(state: JourneyState | null | undefined): boolean {
  const n = journeyNumber(state);
  return n !== null && n >= 7;
}

/** Alias that names the rule rather than the range, for call sites that mean it. */
export function isSuccessOverlayActive(state: JourneyState | null | undefined): boolean {
  return isWorkspaceState(state);
}

/** State 10 proper — the customer-success home is the standing surface. */
export function isCustomerSuccessState(state: JourneyState | null | undefined): boolean {
  return state === "CUSTOMER_SUCCESS";
}
