import "server-only";

import { isSuccessOverlayActive, JOURNEY_STATE_LABEL, journeyNumber } from "@/constants/journeyStates";
import type {
  ChangeLogEntry,
  CustomerDetail,
  CustomerListItem,
  DeploymentHealth,
  FeedbackPulse,
  HealthClass,
  Outcome,
  OutcomeStatus,
  RelationshipTeamMember,
  SuccessPlan,
  SuccessReview,
} from "@/types/customer";
import { getJourney } from "@/mocks/journeyDb";
import { MOCK_LEADS } from "@/mocks/leads";
import { listSupportRequests } from "@/mocks/supportDb";

/**
 * Mock customer-success store.
 *
 * THE POPULATION IS DEFINED BY FIRST PAYMENT, not by contract. Every lead whose
 * journey has reached state 7 appears here, which is the activation rule made
 * literal (Architecture v2.6 §7.1): a paid Assessment customer is a customer.
 * Filtering on state 10 instead would reproduce exactly the bug the rule exists
 * to prevent — a paying customer with no named owner and no support route.
 */

const NOW = Date.parse("2026-07-21T11:00:00Z");

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}

const OUTCOME_TITLES = [
  "Cut inference cost per request",
  "Hold p99 latency under the agreed ceiling",
  "Reduce memory movement on the hot path",
  "Reproduce solver results across releases",
];

const OUTCOME_MEASURES = [
  "Cost per 1M requests against the agreed baseline",
  "p99 latency measured on the customer's own trace",
  "Bytes moved per inference step",
  "Bit-identical results across two consecutive builds",
];

function outcomesFor(clientId: string, health: HealthClass): Outcome[] {
  const seed = Math.abs(hash(clientId));
  return OUTCOME_TITLES.map((title, i) => {
    let status: OutcomeStatus;
    if (health === "at_risk" && i === 0) status = "Off plan";
    else if (health !== "stable" && i === 1) status = "At risk";
    else if ((seed + i) % 4 === 0) status = "Achieved";
    else status = "On plan";

    return {
      id: `${clientId}-outcome-${i + 1}`,
      clientId,
      title,
      status,
      measure: OUTCOME_MEASURES[i],
      targetDate: new Date(NOW + (30 + i * 30) * 86_400_000).toISOString(),
      updatedAt: new Date(NOW - (i + 1) * 2 * 86_400_000).toISOString(),
    };
  });
}

function deploymentsFor(clientId: string, health: HealthClass): DeploymentHealth[] {
  return [
    {
      id: `${clientId}-dep-1`,
      environment: "Production",
      version: "alpha-core 2.4.1",
      status: health === "at_risk" ? "degraded" : "healthy",
      lastCheckedAt: new Date(NOW - 42 * 60_000).toISOString(),
      knownLimitations: [
        "Mixed-precision path is not yet enabled for complex-valued kernels.",
        "Checkpoint restore adds ~90s on the largest configuration.",
      ],
    },
    {
      id: `${clientId}-dep-2`,
      environment: "Staging",
      version: "alpha-core 2.5.0-rc2",
      status: "healthy",
      lastCheckedAt: new Date(NOW - 3 * 3_600_000).toISOString(),
      knownLimitations: [],
    },
  ];
}

function planFor(clientId: string): SuccessPlan {
  return {
    clientId,
    milestones: [
      {
        id: `${clientId}-ms-1`,
        title: "Agree the benchmark baseline and freeze it",
        horizonDays: 30,
        ownerSide: "customer",
        owner: "Customer engineering",
        done: true,
        dependency: true,
      },
      {
        id: `${clientId}-ms-2`,
        title: "Enable the runtime path in staging",
        horizonDays: 30,
        ownerSide: "itrix",
        owner: "Technical Review Team",
        done: true,
        dependency: false,
      },
      {
        id: `${clientId}-ms-3`,
        title: "Run the agreed workload end to end",
        horizonDays: 60,
        ownerSide: "itrix",
        owner: "Assessment Team",
        done: false,
        dependency: false,
      },
      {
        id: `${clientId}-ms-4`,
        title: "Provide production trace for the second workload",
        horizonDays: 60,
        ownerSide: "customer",
        owner: "Customer platform team",
        done: false,
        dependency: true,
      },
      {
        id: `${clientId}-ms-5`,
        title: "Review results and agree what production adoption requires",
        horizonDays: 90,
        ownerSide: "itrix",
        owner: "Success Team",
        done: false,
        dependency: false,
      },
    ],
  };
}

function teamFor(clientId: string, owner: string | null): RelationshipTeamMember[] {
  return [
    {
      id: `${clientId}-team-1`,
      name: owner ?? "Sora Kim",
      role: "Customer success",
      email: "success@iwl.kr",
    },
    { id: `${clientId}-team-2`, name: "Jun Park", role: "Technical", email: "tech@iwl.kr" },
    { id: `${clientId}-team-3`, name: "Fidel Otieno", role: "Executive", email: "exec@iwl.kr" },
    { id: `${clientId}-team-4`, name: "Support desk", role: "Support", email: "support@iwl.kr" },
  ];
}

function feedbackFor(clientId: string, health: HealthClass): FeedbackPulse[] {
  const score = health === "at_risk" ? 2 : health === "watch" ? 3 : 5;
  return [
    {
      id: `${clientId}-pulse-1`,
      clientId,
      score,
      comment:
        score <= 3
          ? "Responses are good but we are still waiting on the staging enablement."
          : "The team has been quick and straight with us.",
      followUpRequested: score <= 3,
      at: new Date(NOW - 5 * 86_400_000).toISOString(),
    },
  ];
}

function changesFor(clientId: string): ChangeLogEntry[] {
  return [
    {
      id: `${clientId}-chg-1`,
      clientId,
      kind: "shipped",
      summary: "alpha-core 2.4.1 rolled out to production.",
      at: new Date(NOW - 2 * 86_400_000).toISOString(),
    },
    {
      id: `${clientId}-chg-2`,
      clientId,
      kind: "resolved",
      summary: "Checkpoint restore timeout on the largest configuration.",
      at: new Date(NOW - 4 * 86_400_000).toISOString(),
    },
    {
      id: `${clientId}-chg-3`,
      clientId,
      kind: "awaiting_decision",
      summary: "Second workload selection — waiting on your platform team.",
      at: new Date(NOW - 6 * 86_400_000).toISOString(),
    },
  ];
}

/**
 * Health is DERIVED, not stored — from open blocking support, outcomes off
 * plan, and the last feedback pulse. Deriving it keeps the health board and the
 * customer-first NBA rule reading the same conditions; a stored grade would
 * drift from the facts that are supposed to justify it.
 */
function healthFor(clientId: string, offPlan: number, blockingSupport: boolean): HealthClass {
  if (blockingSupport || offPlan > 0) return "at_risk";
  if (Math.abs(hash(clientId)) % 3 === 0) return "watch";
  return "stable";
}

function buildCustomers(): CustomerListItem[] {
  const support = listSupportRequests();

  return MOCK_LEADS.filter((lead) => {
    const journey = getJourney(lead.id);
    return isSuccessOverlayActive(journey?.state);
  }).map((lead) => {
    const journey = getJourney(lead.id)!;
    const clientId = `cli_${lead.id}`;
    const mine = support.filter((s) => s.clientId === clientId);
    const openRequests = mine.filter((s) => s.status !== "resolved");
    const blocking = openRequests.some((s) => s.urgency === "blocking");
    const breaching = openRequests.some((s) => Date.parse(s.slaDueAt) <= NOW);

    // Provisional health, so outcomes can be generated against it, then refined.
    const provisional = healthFor(clientId, 0, blocking);
    const outcomes = outcomesFor(clientId, provisional);
    const offPlan = outcomes.filter((o) => o.status === "Off plan").length;
    const healthClass = healthFor(clientId, offPlan, blocking);

    return {
      clientId,
      company: lead.company ?? lead.visitorName ?? clientId,
      journeyNumber: journeyNumber(journey.state) ?? 7,
      stateLabel: JOURNEY_STATE_LABEL[journey.state],
      healthClass,
      outcomes: {
        total: outcomes.length,
        onPlan: outcomes.filter((o) => o.status === "On plan").length,
        atRisk: outcomes.filter((o) => o.status === "At risk").length,
        offPlan,
        achieved: outcomes.filter((o) => o.status === "Achieved").length,
      },
      openSupportRequests: openRequests.length,
      supportBreaching: breaching,
      adoptionPercent: 40 + (Math.abs(hash(clientId)) % 55),
      lastFeedbackScore: feedbackFor(clientId, healthClass)[0]?.score ?? null,
      nextReviewAt: new Date(NOW + (7 + (Math.abs(hash(clientId)) % 21)) * 86_400_000).toISOString(),
      firstPaymentAt: lead.submittedAt,
      owner: lead.owner,
    };
  });
}

let CACHE: CustomerListItem[] | null = null;

function all(): CustomerListItem[] {
  if (!CACHE) CACHE = buildCustomers();
  return CACHE;
}

export function listCustomers(): CustomerListItem[] {
  // Anything needing attention first.
  const urgency = (c: CustomerListItem) =>
    (c.healthClass === "at_risk" ? 2 : c.healthClass === "watch" ? 1 : 0) +
    (c.supportBreaching ? 2 : 0);
  return [...all()].sort((a, b) => urgency(b) - urgency(a) || a.company.localeCompare(b.company));
}

export function getCustomer(clientId: string): CustomerDetail | null {
  const customer = all().find((c) => c.clientId === clientId);
  if (!customer) return null;

  return {
    customer,
    outcomes: outcomesFor(clientId, customer.healthClass),
    deployments: deploymentsFor(clientId, customer.healthClass),
    plan: planFor(clientId),
    team: teamFor(clientId, customer.owner),
    feedback: feedbackFor(clientId, customer.healthClass),
    changes: changesFor(clientId),
  };
}

/** Every outcome across the book — the "are we delivering?" view. */
export function listAllOutcomes(): Outcome[] {
  return all().flatMap((c) => outcomesFor(c.clientId, c.healthClass));
}

/**
 * Scheduled success reviews with their assembled agenda.
 *
 * The agenda leads with whatever is off plan or blocked, because a review that
 * opens with good news and buries the problem wastes the one meeting where the
 * customer is definitely listening.
 */
export function listSuccessReviews(): SuccessReview[] {
  return all()
    .filter((c) => c.nextReviewAt)
    .map((c) => {
      const outcomes = outcomesFor(c.clientId, c.healthClass);
      const agenda: string[] = [];
      for (const o of outcomes) {
        if (o.status === "Off plan") agenda.push(`Off plan: ${o.title}`);
      }
      for (const o of outcomes) {
        if (o.status === "At risk") agenda.push(`At risk: ${o.title}`);
      }
      if (c.openSupportRequests > 0) {
        agenda.push(`${c.openSupportRequests} open support request(s)`);
      }
      agenda.push("Adoption and enablement");
      for (const o of outcomes) {
        if (o.status === "Achieved") agenda.push(`Achieved: ${o.title}`);
      }

      return {
        id: `${c.clientId}-review`,
        clientId: c.clientId,
        company: c.company,
        scheduledAt: c.nextReviewAt!,
        owner: c.owner ?? "Success Team",
        agenda,
      };
    })
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
}

/** Health-board counts for the overview widget. */
export function customerHealthSummary() {
  const rows = all();
  return {
    total: rows.length,
    atRisk: rows.filter((c) => c.healthClass === "at_risk").length,
    watch: rows.filter((c) => c.healthClass === "watch").length,
    breaching: rows.filter((c) => c.supportBreaching).length,
  };
}
