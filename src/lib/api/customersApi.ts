import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import {
  HEALTH_CLASSES,
  type CustomerDetail,
  type CustomerListItem,
  type HealthClass,
  type Outcome,
  type SuccessReview,
} from "@/types/customer";

/**
 * BOUNDARY NORMALISATION (same rule as the shell normaliser — BACKEND_GAPS §4):
 * the tree binds, not the document. The shipped v7.1 board row
 * (`apps/cockpit/services/customers.py`) is thinner than the v7.0 §3.1 shape
 * this surface was built against: no `outcomes` object, no `journeyNumber`,
 * `stateLabel`, `openSupportCount`, `adoptionPercent`, `owner`… Casting it
 * unchecked crashed the whole page inside the render (the error boundary),
 * which is the worst way to say "field missing".
 *
 * So the row is normalised here: what the wire carries passes through, what it
 * doesn't stays `undefined`, and the components render "—" for it. Nothing is
 * fabricated — a zero the backend never asserted is a lie with a unit.
 */

function normalizeHealthClass(value: unknown): HealthClass {
  return (HEALTH_CLASSES as readonly string[]).includes(String(value))
    ? (value as HealthClass)
    : "unknown";
}

function normalizeCustomerRow(raw: Partial<CustomerListItem>): CustomerListItem {
  return {
    ...raw,
    clientId: String(raw.clientId ?? ""),
    company: raw.company ?? "",
    healthClass: normalizeHealthClass(raw.healthClass),
    reasons: Array.isArray(raw.reasons) ? raw.reasons : [],
    expansionAllowed: Boolean(raw.expansionAllowed),
  };
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const data = await apiGet<{ results: Partial<CustomerListItem>[] }>(API.cockpitCustomers);
  return (data.results ?? []).map(normalizeCustomerRow);
}

/**
 * The shipped v7.1 detail is FLAT (the row plus `contractState`), while the
 * fixtures and the v7.0 shape nest it under `customer` with the panel arrays
 * alongside. Both are accepted: a flat read becomes `{ customer }` and the
 * panels stay absent, so the view says "not served yet" instead of "none".
 */
export async function getCustomer(clientId: string): Promise<CustomerDetail> {
  const raw = await apiGet<
    Partial<CustomerDetail> & Partial<CustomerListItem> & { customer?: Partial<CustomerListItem> }
  >(API.cockpitCustomer(clientId));

  const customer = normalizeCustomerRow(raw.customer ?? raw);
  return {
    customer,
    outcomes: Array.isArray(raw.outcomes) ? (raw.outcomes as Outcome[]) : undefined,
    deployments: Array.isArray(raw.deployments) ? raw.deployments : undefined,
    plan: raw.plan && Array.isArray(raw.plan.milestones) ? raw.plan : undefined,
    team: Array.isArray(raw.team) ? raw.team : undefined,
    feedback: Array.isArray(raw.feedback) ? raw.feedback : undefined,
    changes: Array.isArray(raw.changes) ? raw.changes : undefined,
    contractState: typeof raw.contractState === "string" ? raw.contractState : undefined,
  };
}

export async function getAllOutcomes(): Promise<Outcome[]> {
  const data = await apiGet<{ results: Outcome[] }>(`${API.cockpitCustomers}/outcomes`);
  return data.results;
}

export async function getSuccessReviews(): Promise<SuccessReview[]> {
  const data = await apiGet<{ results: SuccessReview[] }>(API.successReviews);
  return data.results;
}
