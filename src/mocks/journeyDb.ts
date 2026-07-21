import "server-only";

import {
  ALLOWED_TRANSITIONS,
  EVENT_REVEAL,
  JOURNEY_PROGRESSION,
  JOURNEY_STATE_LABEL,
  JOURNEY_STATES,
  STATE_REVEAL,
  advanceChangesState,
  isSuccessOverlayActive,
  journeyNumber,
  progressionIndex,
  stateKey,
  targetForEvent,
  type JourneyEvent,
  type JourneyState,
} from "@/constants/journeyStates";
import {
  STATE_CEILING,
  composerLabelForState,
  sectionsForState,
} from "@/constants/shellContract";
import type { LeadStatus } from "@/constants/statuses";
import type {
  JourneyAdvanceResult,
  JourneyLead,
  JourneyMigrationReport,
  JourneyMigrationRow,
  JourneyOverview,
  JourneyTransition,
  ShellContract,
} from "@/types/journey";
import { getLead } from "@/mocks/leadsDb";
import { MOCK_LEADS } from "@/mocks/leads";

/**
 * Mock journey store. In mock mode there is no backend state machine, so we
 * synthesize a plausible journey for each existing mock lead (derived from its
 * pipeline status) and let operators advance it in-session. Overrides persist
 * for the life of the process, mirroring the other `*Db` stores.
 *
 * v5.0: ten numbered states, the shell contract, and a dry-run report for the
 * ENGAGED split.
 */

const overrides = new Map<string, { state: JourneyState; transitions: JourneyTransition[] }>();

/**
 * Map a lead's pipeline status onto a representative journey state.
 *
 * The three statuses that used to collapse into `ENGAGED` now land on their own
 * rungs, which is the whole point of the split: Evaluation is the paid
 * Assessment (7), PoC is (8), and Licensed is a contracted customer (10).
 */
const STATUS_TO_STATE: Record<LeadStatus, JourneyState> = {
  New: "IN_REVIEW",
  Contacted: "DIAGNOSED",
  "Meeting Booked": "CLIENT_PAGE",
  NDA: "INVITED",
  Evaluation: "ASSESSMENT",
  PoC: "POC",
  Licensed: "CUSTOMER_SUCCESS",
  Closed: "DORMANT",
};

/** The canonical happy-path steps, in order along the numbered ladder. */
const HAPPY_PATH: ReadonlyArray<{ from: JourneyState; to: JourneyState; event: JourneyEvent }> = [
  { from: "ARRIVED", to: "IN_REVIEW", event: "first_turn" },
  { from: "IN_REVIEW", to: "DIAGNOSED", event: "loop_closed" },
  { from: "DIAGNOSED", to: "CLIENT_PAGE", event: "reveal_client_page" },
  { from: "CLIENT_PAGE", to: "INVITED", event: "gate_invite" },
  { from: "INVITED", to: "NDA_REVIEW", event: "accept_invite" },
  { from: "NDA_REVIEW", to: "ASSESSMENT", event: "first_payment" },
  { from: "ASSESSMENT", to: "POC", event: "poc_start" },
  { from: "POC", to: "INTEGRATION", event: "integration_start" },
  { from: "INTEGRATION", to: "CUSTOMER_SUCCESS", event: "contract_executed" },
];

function pathTo(target: JourneyState): typeof HAPPY_PATH {
  if (target === "ARRIVED") return [];
  if (target === "DORMANT") {
    return [
      { from: "ARRIVED", to: "IN_REVIEW", event: "first_turn" },
      { from: "IN_REVIEW", to: "DIAGNOSED", event: "loop_closed" },
      { from: "DIAGNOSED", to: "CLIENT_PAGE", event: "reveal_client_page" },
      { from: "CLIENT_PAGE", to: "DORMANT", event: "gate_dormant" },
    ];
  }
  // progressionIndex is 0 for ARRIVED, so it doubles as "steps taken to get here".
  return HAPPY_PATH.slice(0, Math.max(progressionIndex(target), 0));
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
  const rows: JourneyTransition[] = steps.map((step, i) => ({
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

/**
 * Build the shell contract the way `shell.for_subject` does: derived from state
 * and identity, never chosen. The dashboard renders this read-only so an
 * operator can see exactly what the visitor's surface is authorized to show.
 */
function buildShell(leadId: string, state: JourneyState, owner: string | null): ShellContract {
  const n = journeyNumber(state) ?? 1;
  const identityState =
    n >= 10 ? "authenticated_customer" : n >= 6 ? "identified" : n >= 3 ? "identified" : "anonymous";

  return {
    threadId: `thr_${leadId}`,
    journeyState: n,
    stateKey: stateKey(state),
    identityState,
    disclosureCeiling: STATE_CEILING[state],
    valueDelivered: valueDelivered(state),
    composerLabel: composerLabelForState(state),
    // The loop is open only while the platform is still listening (state 2).
    questionLoopOpen: n === 2,
    attachmentsEnabled: true,
    sidebarSections: sectionsForState(n),
    conversationHeader: {
      title: "Compute bottleneck review",
      stateLabel: JOURNEY_STATE_LABEL[state],
      // A named owner appears from identification onward, never before.
      humanOwner: identityState === "anonymous" ? null : owner,
      supportSla: isSuccessOverlayActive(state) ? "2h" : null,
      quickHelp: identityState !== "anonymous",
    },
  };
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
    journeyNumber: journeyNumber(state),
    stateKey: stateKey(state),
    valueDelivered: valueDelivered(state),
    accountInviteAvailable: inviteGate(lead.tier, lead.specialRights),
    successOverlayActive: isSuccessOverlayActive(state),
    shell: buildShell(leadId, state, lead.owner),
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

  /**
   * A reveal can come from arriving at a state OR from the event itself.
   * `nda_signed` is the latter: it raises the ceiling and opens the data room
   * without moving the subject, so keying the reveal off the target state alone
   * would silently drop reveal ④.
   */
  const reveal = advanceChangesState(from, to)
    ? (STATE_REVEAL[to] ?? EVENT_REVEAL[event] ?? "")
    : (EVENT_REVEAL[event] ?? "");

  const transition: JourneyTransition = {
    id: `${leadId}-jt-${journey.transitions.length}`,
    fromState: from,
    toState: to,
    event,
    reveal,
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
      changed: advanceChangesState(from, to),
      reveal: reveal ? { surface: reveal } : null,
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

/* ── ENGAGED-split migration report ───────────────────────────────────────── */

/**
 * The dry-run report reviewed BEFORE the data migration is applied.
 *
 * In mock mode there is no legacy data to migrate, so this reconstructs what
 * the report would say by reading each lead's pipeline status the same way the
 * backend migration reads Evaluation / PoC / license-out records. The value is
 * that the operator sees the SHAPE of the decision — including which rows no
 * record could justify — before anything is written.
 *
 * A lead whose status gives no evidence falls back to the earliest state in the
 * range (ASSESSMENT) and is flagged `needsReview`. Falling back to the earliest
 * rung is deliberate: under-stating progress is recoverable, over-stating it
 * would show a lead as having cleared a gate it has not.
 */
const LEGACY_ENGAGED_STATUSES: ReadonlySet<LeadStatus> = new Set<LeadStatus>([
  "Evaluation",
  "PoC",
  "Licensed",
]);

export function getMigrationReport(): JourneyMigrationReport {
  const rows: JourneyMigrationRow[] = [];

  for (const lead of MOCK_LEADS) {
    const legacyEngaged = LEGACY_ENGAGED_STATUSES.has(lead.status);
    const legacyClient = lead.status === "NDA";
    if (!legacyEngaged && !legacyClient) continue;

    if (legacyClient) {
      rows.push({
        leadId: lead.id,
        label: lead.company ?? lead.visitorName ?? lead.id,
        legacyState: "CLIENT",
        proposedState: "NDA_REVIEW",
        evidence: "none",
        evidenceDetail: "Straight rename — CLIENT always meant NDA review.",
        needsReview: false,
      });
      continue;
    }

    const { proposedState, evidence, evidenceDetail } = ((): {
      proposedState: JourneyState;
      evidence: JourneyMigrationRow["evidence"];
      evidenceDetail: string;
    } => {
      switch (lead.status) {
        case "Evaluation":
          return {
            proposedState: "ASSESSMENT",
            evidence: "evaluation",
            evidenceDetail: "An Evaluation record exists — this is the paid Assessment.",
          };
        case "PoC":
          return {
            proposedState: "POC",
            evidence: "poc",
            evidenceDetail: "A PoC record exists with agreed KPIs.",
          };
        case "Licensed":
          return {
            proposedState: "CUSTOMER_SUCCESS",
            evidence: "contract",
            evidenceDetail: "A license-out agreement is recorded — contract executed.",
          };
        default:
          return {
            proposedState: "ASSESSMENT",
            evidence: "none",
            evidenceDetail:
              "No Evaluation, PoC or license record found. Falling back to the earliest " +
              "rung in the range — confirm before applying.",
          };
      }
    })();

    rows.push({
      leadId: lead.id,
      label: lead.company ?? lead.visitorName ?? lead.id,
      legacyState: "ENGAGED",
      proposedState,
      evidence,
      evidenceDetail,
      needsReview: evidence === "none",
    });
  }

  const proposed: Partial<Record<JourneyState, number>> = {};
  for (const row of rows) {
    proposed[row.proposedState] = (proposed[row.proposedState] ?? 0) + 1;
  }

  return {
    // Stable in mock mode so the panel doesn't churn on every poll.
    generatedAt: "2026-07-21T09:00:00Z",
    totalLegacy: rows.length,
    proposed,
    needsReviewCount: rows.filter((r) => r.needsReview).length,
    rows,
  };
}

/** Ordered states for the distribution chart: the ladder, then off-ladder. */
export const DISTRIBUTION_ORDER: readonly JourneyState[] = [
  ...JOURNEY_PROGRESSION,
  "DORMANT",
];
