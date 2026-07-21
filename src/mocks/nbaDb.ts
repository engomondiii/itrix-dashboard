import "server-only";

import type {
  CommercialOverride,
  CustomerNextAction,
  NbaCandidate,
  SuppressionReason,
} from "@/types/nba";
import { getCustomer } from "@/mocks/customersDb";
import { listSupportRequests } from "@/mocks/supportDb";

/**
 * The customer-first precedence rule, implemented once.
 *
 * This mirrors `nba_precedence.py`, which is the authority. It is implemented
 * here rather than faked with a static fixture because the rule is the point:
 * a mock that always returned a commercial action would let the Phase 3
 * acceptance test ("with a blocking support issue open, no commercial action
 * can be ranked primary") pass against nothing.
 *
 * The candidate set is always returned in full, with the demoted ones marked.
 * Hiding suppressed candidates would make the rule invisible — an operator
 * would see one action and never learn that a commercial option existed and was
 * ruled out, which is exactly the transparency §18.7 asks for.
 */

const ADOPTION_PLAN_THRESHOLD = 60;
const TRUST_SIGNAL_THRESHOLD = 3;

const overrides: CommercialOverride[] = [];

export function getCustomerNextAction(clientId: string): CustomerNextAction | null {
  const detail = getCustomer(clientId);
  if (!detail) return null;

  const { customer, outcomes, feedback } = detail;
  const open = listSupportRequests(clientId).filter((r) => r.status !== "resolved");
  const blocking = open.find((r) => r.urgency === "blocking");
  const offPlan = outcomes.find((o) => o.status === "Off plan");
  const lastPulse = feedback[0];

  /* ── Evaluate the precedence rule, in order. The FIRST condition that holds
        both names the primary action and becomes the suppression reason. ──── */

  let suppressionReason: SuppressionReason | null = null;
  let primary: NbaCandidate | null = null;

  if (blocking) {
    suppressionReason = "blocking_support_issue";
    primary = {
      id: `${clientId}-nba-support`,
      type: "support",
      label: `Resolve support request — ${blocking.subject}`,
      rationale:
        "A blocking issue is open. Nothing else matters to this customer until it is fixed.",
      commercial: false,
      suppressedBy: null,
    };
  } else if (offPlan) {
    suppressionReason = "outcome_off_plan";
    primary = {
      id: `${clientId}-nba-outcome`,
      type: "outcome",
      label: `Get "${offPlan.title}" back on plan`,
      rationale:
        "An outcome we agreed together is off plan. Fix the commitment before asking for another.",
      commercial: false,
      suppressedBy: null,
    };
  } else if (customer.adoptionPercent < ADOPTION_PLAN_THRESHOLD) {
    suppressionReason = "adoption_below_plan";
    primary = {
      id: `${clientId}-nba-enablement`,
      type: "enablement",
      label: "Run an enablement session with the platform team",
      rationale: `Adoption is at ${customer.adoptionPercent}%, below the agreed level. Selling more of something half-used does not help them.`,
      commercial: false,
      suppressedBy: null,
    };
  } else if (lastPulse && lastPulse.score <= TRUST_SIGNAL_THRESHOLD) {
    suppressionReason = "negative_trust_signal";
    primary = {
      id: `${clientId}-nba-outreach`,
      type: "human_outreach",
      label: "Named human reaches out about the recent feedback",
      rationale:
        "Private feedback was negative. A person should ask what is wrong before anything else is proposed.",
      commercial: false,
      suppressedBy: null,
    };
  }

  const commercialCandidate: NbaCandidate = {
    id: `${clientId}-nba-commercial`,
    type: "commercial",
    label: "Propose the next rung of the pathway",
    rationale:
      "Health is stable, outcomes are on plan and adoption is at the agreed level.",
    commercial: true,
    suppressedBy: suppressionReason,
  };

  if (!primary) {
    // Nothing suppressed it — step 5. Commercial work is eligible.
    primary = { ...commercialCandidate, suppressedBy: null };
  }

  const candidates: NbaCandidate[] = [primary];
  if (primary.type !== "commercial") candidates.push(commercialCandidate);

  return {
    clientId,
    primary,
    candidates,
    suppressionReason,
    canActCommercially: suppressionReason === null,
  };
}

/**
 * Record a commercial override.
 *
 * There is no path that clears the suppression itself — the override does not
 * make the rule pass, it records that a human acted against it. That
 * distinction is the whole design: the condition stays visible afterwards.
 */
export function recordCommercialOverride(
  clientId: string,
  reason: string,
  by: string,
): CommercialOverride | null {
  if (!reason.trim()) return null;
  const entry: CommercialOverride = {
    clientId,
    reason: reason.trim(),
    by,
    at: new Date().toISOString(),
  };
  overrides.push(entry);
  return entry;
}

export function listCommercialOverrides(clientId?: string): CommercialOverride[] {
  return clientId ? overrides.filter((o) => o.clientId === clientId) : [...overrides];
}
