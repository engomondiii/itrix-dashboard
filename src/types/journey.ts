import type {
  JourneyEvent,
  JourneyState,
  RevealSurface,
} from "@/constants/journeyStates";

/** One append-only journey transition (audit + timeline). Mirrors JourneyTransitionSerializer. */
export interface JourneyTransition {
  id: string;
  fromState: JourneyState;
  toState: JourneyState;
  event: JourneyEvent;
  /** The reveal this transition unlocked, or "" if none. */
  reveal: RevealSurface | "";
  meta: Record<string, unknown>;
  at: string; // ISO
}

/** A lead's journey read (Backend `JourneyLeadSerializer`). */
export interface JourneyLead {
  leadId: string;
  state: JourneyState;
  /** True once the lead has reached DIAGNOSED (a value artifact was delivered). */
  valueDelivered: boolean;
  /** True when the deterministic invite gate would pass. */
  accountInviteAvailable: boolean;
  transitions: JourneyTransition[];
}

/** Result of a manual advance (`POST journey/leads/{id}/advance/`). */
export interface JourneyAdvanceResult {
  leadId: string;
  fromState: JourneyState;
  toState: JourneyState;
  event: JourneyEvent;
  changed: boolean;
  reveal: Record<string, unknown> | null;
}

export interface JourneyAdvanceInput {
  event: JourneyEvent;
  meta?: Record<string, unknown>;
}

/** Distribution of leads across journey states (overview widget). */
export interface JourneyOverview {
  distribution: Record<JourneyState, number>;
  total: number;
}
