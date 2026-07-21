import type {
  JourneyEvent,
  JourneyState,
  RevealSurface,
  StateKey,
} from "@/constants/journeyStates";
import type {
  DisclosureCeiling,
  IdentityState,
  SidebarSectionKey,
} from "@/constants/shellContract";

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

/**
 * The shell contract for a subject — what Surface 1 is authorized to render
 * (Backend v6.0 §3.1 `shell.for_subject`).
 *
 * `left_rail` and `right_rail` are deliberately absent. The backend emits them
 * as deprecated stubs for one release and then removes them; nothing here reads
 * them, so this surface is already on the far side of that migration.
 */
export interface ShellContract {
  threadId: string | null;
  journeyState: number; // 1..10
  stateKey: StateKey;
  identityState: IdentityState;
  disclosureCeiling: DisclosureCeiling;
  valueDelivered: boolean;
  composerLabel: string;
  /** Whether suggestion chips render — the question loop is still open. */
  questionLoopOpen: boolean;
  /** Whether the attach control is active for this plane and state. */
  attachmentsEnabled: boolean;
  /** Ordered, closed vocabulary. Replaces left_rail. */
  sidebarSections: SidebarSectionKey[];
  conversationHeader: ConversationHeaderContract;
}

/**
 * The conversation header — the home of the two guarantees the retired right
 * rail was carrying that cannot be lost: a named owner and one-action reach to
 * a human (Architecture v2.6 §11.6A, R30).
 */
export interface ConversationHeaderContract {
  title: string;
  stateLabel: string;
  humanOwner: string | null;
  supportSla: string | null;
  quickHelp: boolean;
}

/**
 * A lead's journey read (Backend `JourneyLeadSerializer`).
 *
 * THE v6.0 FIELDS ARE OPTIONAL, AND THAT IS NOT DEFENSIVE PADDING — it is what
 * the wire actually looks like today. `shell`, `journeyNumber`, `stateKey` and
 * `successOverlayActive` are Backend v6.0 §3.1 additions; the running Django
 * still serves the v3-era payload without them. Typing them as required told
 * the compiler a lie, and the first component to dereference `journey.shell`
 * crashed the whole lead page in production.
 *
 * Use `normalizeJourney` (lib/api/journeyApi.ts) rather than reading these
 * straight off the response: it derives what can be derived from `state` and
 * leaves genuinely absent things absent.
 */
export interface JourneyLead {
  leadId: string;
  state: JourneyState;
  /** `journey_number` 1–10, or null for the off-ladder DORMANT. [v6.0] */
  journeyNumber?: number | null;
  /** [v6.0] */
  stateKey?: StateKey;
  /** True once the lead has reached DIAGNOSED (a value artifact was delivered). */
  valueDelivered: boolean;
  /** True when the deterministic invite gate would pass. */
  accountInviteAvailable: boolean;
  /**
   * True from the FIRST PAYMENT (state 7), not from license-out. A paid
   * Assessment customer already has named owners, support access and success
   * goals (Architecture v2.6 §7.1). [v6.0]
   */
  successOverlayActive?: boolean;
  /**
   * What Surface 1 may render for this subject right now. [v6.0 — absent until
   * the backend ships `shell.for_subject`.]
   */
  shell?: ShellContract;
  transitions: JourneyTransition[];
}

/** Result of a manual advance (`POST journey/leads/{id}/advance/`). */
export interface JourneyAdvanceResult {
  leadId: string;
  fromState: JourneyState;
  toState: JourneyState;
  event: JourneyEvent;
  /** False for a self-transition such as `nda_signed`, which reveals in place. */
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

/* ── ENGAGED-split migration report ───────────────────────────────────────── */

/**
 * What justified splitting a legacy `ENGAGED` lead into ASSESSMENT / POC /
 * INTEGRATION. The backend data migration reads Evaluation, PoC and
 * license-out records to decide (Backend v6.0 §09 Phase 1,
 * `0003_migrate_engaged_split.py`).
 */
export type MigrationEvidence =
  | "evaluation"
  | "poc"
  | "integration"
  | "contract"
  | "none";

export interface JourneyMigrationRow {
  leadId: string;
  label: string;
  /** The retired wire value currently stored: "ENGAGED" or "CLIENT". */
  legacyState: string;
  proposedState: JourneyState;
  evidence: MigrationEvidence;
  evidenceDetail: string;
  /**
   * True when no record justified the split and the migration fell back to the
   * earliest state in the range. These are the rows a human must look at —
   * the reason the report exists at all.
   */
  needsReview: boolean;
}

/**
 * A DRY RUN. Nothing has been written when this is rendered — it is reviewed
 * before `0003_migrate_engaged_split` is applied, and the migration is
 * reversible. Surface 2 v5.0 §00.1 item 5.
 */
export interface JourneyMigrationReport {
  generatedAt: string; // ISO
  totalLegacy: number;
  /** Proposed state → count. */
  proposed: Partial<Record<JourneyState, number>>;
  needsReviewCount: number;
  rows: JourneyMigrationRow[];
}
