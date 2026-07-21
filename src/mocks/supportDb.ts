import "server-only";

import { isSuccessOverlayActive } from "@/constants/journeyStates";
import type {
  SupportQueueSummary,
  SupportRequest,
  SupportStatus,
  SupportUrgency,
} from "@/types/support";
import { getJourney } from "@/mocks/journeyDb";
import { MOCK_LEADS } from "@/mocks/leads";

/**
 * Mock support queue.
 *
 * Deliberately seeded with at least one BLOCKING request that has breached its
 * SLA. That single row is what exercises the customer-first rule end to end: it
 * must push its customer to `at_risk` on the health board, suppress every
 * commercial next-best-action for them, and pin itself to the top of this
 * queue. A mock population of politely-normal tickets would let all three
 * regress silently.
 *
 * Note this module must not import `customersDb` — that module imports this one
 * to derive health, and the cycle would be a real one rather than a
 * type-only edge.
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

const SUBJECTS: ReadonlyArray<{
  subject: string;
  body: string;
  urgency: SupportUrgency;
}> = [
  {
    subject: "Production inference stalls after checkpoint restore",
    body:
      "Since the 2.4.1 rollout, restoring from checkpoint on the largest configuration " +
      "hangs for several minutes and then falls back to the previous path. This is on " +
      "the production fleet.",
    urgency: "blocking",
  },
  {
    subject: "Mixed-precision path not enabled in staging",
    body: "We were expecting the mixed-precision path to be available for the second workload.",
    urgency: "high",
  },
  {
    subject: "Question about reproducing the benchmark baseline",
    body: "Our numbers differ slightly from the agreed baseline. Can we walk through the setup?",
    urgency: "normal",
  },
  {
    subject: "Documentation gap in the runtime integration guide",
    body: "The guide skips the step where the dispatch table is registered.",
    urgency: "low",
  },
];

const SLA_HOURS: Record<SupportUrgency, number> = {
  blocking: 1,
  high: 4,
  normal: 8,
  low: 24,
};

function buildRequests(): SupportRequest[] {
  const customers = MOCK_LEADS.filter((lead) =>
    isSuccessOverlayActive(getJourney(lead.id)?.state),
  );

  const out: SupportRequest[] = [];

  customers.forEach((lead, customerIndex) => {
    const clientId = `cli_${lead.id}`;
    const company = lead.company ?? lead.visitorName ?? clientId;
    const seed = Math.abs(hash(clientId));

    // The first customer always carries the blocking, breached request.
    const count = customerIndex === 0 ? 2 : seed % 3;

    for (let i = 0; i < count; i += 1) {
      const spec = customerIndex === 0 && i === 0 ? SUBJECTS[0] : SUBJECTS[1 + ((seed + i) % 3)];
      const createdAt = new Date(NOW - (2 + i * 5) * 3_600_000).toISOString();
      const slaDueAt = new Date(
        Date.parse(createdAt) + SLA_HOURS[spec.urgency] * 3_600_000,
      ).toISOString();

      const status: SupportStatus =
        customerIndex === 0 && i === 0
          ? "open"
          : (seed + i) % 4 === 0
            ? "resolved"
            : (seed + i) % 3 === 0
              ? "waiting"
              : "assigned";

      out.push({
        id: `sup-${clientId}-${i + 1}`,
        clientId,
        company,
        subject: spec.subject,
        body: spec.body,
        status,
        urgency: spec.urgency,
        owner: status === "open" ? null : (lead.owner ?? "Support desk"),
        slaDueAt,
        createdAt,
        resolvedAt:
          status === "resolved" ? new Date(Date.parse(createdAt) + 5_400_000).toISOString() : null,
        customerConfirmedResolved: status === "resolved" ? true : null,
      });
    }
  });

  return out;
}

let CACHE: SupportRequest[] | null = null;
const overrides = new Map<string, Partial<SupportRequest>>();

function all(): SupportRequest[] {
  if (!CACHE) CACHE = buildRequests();
  return CACHE.map((r) => ({ ...r, ...(overrides.get(r.id) ?? {}) }));
}

export function listSupportRequests(clientId?: string): SupportRequest[] {
  const rows = clientId ? all().filter((r) => r.clientId === clientId) : all();

  // Breaching first, then blocking, then by SLA due time. An operator scanning
  // this list should never have to hunt for the thing that is already late.
  return [...rows].sort((a, b) => {
    const aBreach = a.status !== "resolved" && Date.parse(a.slaDueAt) <= NOW ? 1 : 0;
    const bBreach = b.status !== "resolved" && Date.parse(b.slaDueAt) <= NOW ? 1 : 0;
    if (aBreach !== bBreach) return bBreach - aBreach;
    const aBlock = a.urgency === "blocking" ? 1 : 0;
    const bBlock = b.urgency === "blocking" ? 1 : 0;
    if (aBlock !== bBlock) return bBlock - aBlock;
    return Date.parse(a.slaDueAt) - Date.parse(b.slaDueAt);
  });
}

export function getSupportRequest(id: string): SupportRequest | null {
  return all().find((r) => r.id === id) ?? null;
}

export type SupportActionOutcome =
  | { ok: true; request: SupportRequest }
  | { ok: false; status: 404 | 409; detail: string };

export function assignSupportRequest(id: string, owner: string): SupportActionOutcome {
  const request = getSupportRequest(id);
  if (!request) return { ok: false, status: 404, detail: "Not found" };
  overrides.set(id, { ...overrides.get(id), owner, status: "assigned" });
  return { ok: true, request: { ...request, owner, status: "assigned" } };
}

export function escalateSupportRequest(id: string, reason: string): SupportActionOutcome {
  const request = getSupportRequest(id);
  if (!request) return { ok: false, status: 404, detail: "Not found" };
  if (!reason.trim()) {
    return { ok: false, status: 409, detail: "An escalation requires a reason." };
  }
  overrides.set(id, { ...overrides.get(id), status: "escalated", urgency: "blocking" });
  return {
    ok: true,
    request: { ...request, status: "escalated", urgency: "blocking" },
  };
}

export function resolveSupportRequest(id: string, resolution: string): SupportActionOutcome {
  const request = getSupportRequest(id);
  if (!request) return { ok: false, status: 404, detail: "Not found" };
  if (!resolution.trim()) {
    return { ok: false, status: 409, detail: "A resolution needs a message." };
  }
  const resolvedAt = new Date().toISOString();
  overrides.set(id, {
    ...overrides.get(id),
    status: "resolved",
    resolvedAt,
    // The customer has not confirmed yet — "did this actually resolve it for
    // you?" is asked after, and until they answer this stays null rather than
    // defaulting to true.
    customerConfirmedResolved: null,
  });
  return {
    ok: true,
    request: { ...request, status: "resolved", resolvedAt, customerConfirmedResolved: null },
  };
}

export function supportQueueSummary(): SupportQueueSummary {
  const rows = all().filter((r) => r.status !== "resolved");
  return {
    open: rows.length,
    breaching: rows.filter((r) => Date.parse(r.slaDueAt) <= NOW).length,
    blocking: rows.filter((r) => r.urgency === "blocking").length,
  };
}

/** Does this customer have an open blocking issue? Drives NBA suppression. */
export function hasBlockingSupportIssue(clientId: string): boolean {
  return all().some(
    (r) => r.clientId === clientId && r.status !== "resolved" && r.urgency === "blocking",
  );
}
