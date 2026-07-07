/**
 * Journey state machine vocabulary (Surface 2 v3.0 · Backend v4 §3.2).
 * Single-sourced with the backend `apps/journey/models.py` — states, events,
 * reveal surfaces, and the authoritative transition table. The dashboard mirrors
 * these read-only; state is only ever changed via `POST journey/leads/{id}/advance/`.
 */

/** The eight journey states. */
export const JOURNEY_STATES = [
  "ARRIVED",
  "IN_REVIEW",
  "DIAGNOSED",
  "CLIENT_PAGE",
  "INVITED",
  "CLIENT",
  "ENGAGED",
  "DORMANT",
] as const;
export type JourneyState = (typeof JOURNEY_STATES)[number];

/** Linear "happy path" order (excludes DORMANT, which is a branch) — used for progress. */
export const JOURNEY_PROGRESSION: readonly JourneyState[] = [
  "ARRIVED",
  "IN_REVIEW",
  "DIAGNOSED",
  "CLIENT_PAGE",
  "INVITED",
  "CLIENT",
  "ENGAGED",
];

export const JOURNEY_STATE_LABEL: Record<JourneyState, string> = {
  ARRIVED: "Arrived",
  IN_REVIEW: "In review",
  DIAGNOSED: "Diagnosed",
  CLIENT_PAGE: "Client page",
  INVITED: "Invited",
  CLIENT: "Client",
  ENGAGED: "Engaged",
  DORMANT: "Dormant",
};

/** One-line description of what each state means for the operator. */
export const JOURNEY_STATE_DESCRIPTION: Record<JourneyState, string> = {
  ARRIVED: "Anonymous visitor on the public site.",
  IN_REVIEW: "Describing their bottleneck / answering qualification.",
  DIAGNOSED: "Diagnosis ran — lead created, scored and routed. Value delivered.",
  CLIENT_PAGE: "Viewing their personalized client page (reveal ①).",
  INVITED: "Passed the gate — account creation unlocked (reveal ②).",
  CLIENT: "Account created — full portal access (reveal ③).",
  ENGAGED: "Active in evaluation / PoC with NDA-gated content (reveal ④).",
  DORMANT: "Nurture — inactive, or below the invite gate.",
};

type BadgeIntent = "info" | "warning" | "success" | "neutral" | "gold" | "error";

export const JOURNEY_STATE_INTENT: Record<JourneyState, BadgeIntent> = {
  ARRIVED: "neutral",
  IN_REVIEW: "info",
  DIAGNOSED: "info",
  CLIENT_PAGE: "info",
  INVITED: "warning",
  CLIENT: "success",
  ENGAGED: "gold",
  DORMANT: "neutral",
};

/** The events that drive transitions (`advance(subject, event)`). */
export const JOURNEY_EVENTS = [
  "prompt",
  "qualify",
  "reveal_client_page",
  "gate_invite",
  "gate_dormant",
  "accept_invite",
  "engage",
  "reactivate",
] as const;
export type JourneyEvent = (typeof JOURNEY_EVENTS)[number];

/** Operator-facing labels for a manual advance action. */
export const JOURNEY_EVENT_LABEL: Record<JourneyEvent, string> = {
  prompt: "Mark prompt submitted",
  qualify: "Mark qualification complete",
  reveal_client_page: "Reveal client page",
  gate_invite: "Pass invite gate",
  gate_dormant: "Move to nurture",
  accept_invite: "Mark invite accepted",
  engage: "Mark NDA / evaluation started",
  reactivate: "Reactivate",
};

/** The four reveal surfaces a capability token can grant (reveals ①–④). */
export const REVEAL_SURFACES = [
  "client_page",
  "account_invite",
  "portal",
  "data_room",
] as const;
export type RevealSurface = (typeof REVEAL_SURFACES)[number];

export const REVEAL_SURFACE_LABEL: Record<RevealSurface, string> = {
  client_page: "Client page",
  account_invite: "Account invite",
  portal: "Client portal",
  data_room: "Data room",
};

/** ①–④ ordinal shown against each reveal. */
export const REVEAL_ORDINAL: Record<RevealSurface, string> = {
  client_page: "①",
  account_invite: "②",
  portal: "③",
  data_room: "④",
};

/**
 * The authoritative transition table `{from: {event: to}}` — mirrors the
 * backend `ALLOWED_TRANSITIONS`. Used to offer only valid manual advances.
 */
export const ALLOWED_TRANSITIONS: Record<
  JourneyState,
  Partial<Record<JourneyEvent, JourneyState>>
> = {
  ARRIVED: { prompt: "IN_REVIEW", qualify: "DIAGNOSED" },
  IN_REVIEW: { qualify: "DIAGNOSED" },
  DIAGNOSED: { reveal_client_page: "CLIENT_PAGE" },
  CLIENT_PAGE: { gate_invite: "INVITED", gate_dormant: "DORMANT" },
  INVITED: { accept_invite: "CLIENT", gate_dormant: "DORMANT" },
  CLIENT: { engage: "ENGAGED", gate_dormant: "DORMANT" },
  ENGAGED: {},
  DORMANT: { reactivate: "CLIENT_PAGE" },
};

/** Which reveal (if any) a resulting state unlocks — mirrors backend STATE_REVEAL. */
export const STATE_REVEAL: Partial<Record<JourneyState, RevealSurface>> = {
  CLIENT_PAGE: "client_page",
  INVITED: "account_invite",
  CLIENT: "portal",
  ENGAGED: "data_room",
};

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

/** Progress index on the happy path (DORMANT resolves to -1). */
export function progressionIndex(state: JourneyState): number {
  return JOURNEY_PROGRESSION.indexOf(state);
}
