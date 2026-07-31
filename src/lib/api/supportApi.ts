import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import {
  SUPPORT_STATUSES,
  SUPPORT_URGENCIES,
  type SupportQueueSummary,
  type SupportRequest,
  type SupportStatus,
  type SupportUrgency,
} from "@/types/support";

/**
 * BOUNDARY NORMALISATION (the tree binds — BACKEND_GAPS §4). The shipped v7.1
 * queue row (`apps/cockpit/services/support_queue.py`) differs from this
 * surface's vocabulary in three ways, all mapped here rather than in render:
 *
 *   · `requestId` → `id`
 *   · status `in_progress` → `assigned`, `waiting_on_customer` → `waiting`
 *   · urgency: the wire has `critical|high|normal|low` plus a SEPARATE
 *     `blocking` boolean. Here `blocking` is the top urgency, so a blocking
 *     row renders as such regardless of its estimate — §18.7 makes blocking a
 *     fact about the customer's day, which outranks anyone's severity guess.
 *     A non-blocking `critical` maps to `high` (the closest word we render).
 */

const STATUS_FROM_WIRE: Record<string, SupportStatus> = {
  open: "open",
  in_progress: "assigned",
  assigned: "assigned",
  waiting_on_customer: "waiting",
  waiting: "waiting",
  resolved: "resolved",
  escalated: "escalated",
};

function normalizeStatus(value: unknown): SupportStatus {
  return STATUS_FROM_WIRE[String(value)] ?? "open";
}

function normalizeUrgency(raw: { urgency?: unknown; blocking?: unknown }): SupportUrgency {
  if (raw.blocking) return "blocking";
  if (raw.urgency === "critical") return "high";
  return (SUPPORT_URGENCIES as readonly string[]).includes(String(raw.urgency))
    ? (raw.urgency as SupportUrgency)
    : "normal";
}

type WireSupportRow = Partial<SupportRequest> & {
  requestId?: string;
};

function normalizeSupportRow(raw: WireSupportRow): SupportRequest {
  return {
    ...raw,
    id: String(raw.id ?? raw.requestId ?? ""),
    clientId: String(raw.clientId ?? ""),
    company: raw.company ?? "",
    subject: raw.subject ?? "",
    status: (SUPPORT_STATUSES as readonly string[]).includes(String(raw.status))
      ? (raw.status as SupportStatus)
      : normalizeStatus(raw.status),
    urgency: normalizeUrgency(raw),
    owner: raw.owner || null,
    slaDueAt: raw.slaDueAt ?? null,
    createdAt: raw.createdAt ?? "",
    resolvedAt: raw.resolvedAt ?? null,
    customerConfirmedResolved: raw.customerConfirmedResolved ?? null,
  };
}

type WireSummary = Partial<SupportQueueSummary> & { blockingOpen?: number };

function normalizeSummary(raw: WireSummary | undefined): SupportQueueSummary {
  return {
    open: raw?.open ?? 0,
    breaching: raw?.breaching ?? 0,
    // v7.1 names it `blockingOpen`; the older shape said `blocking`.
    blocking: raw?.blocking ?? raw?.blockingOpen ?? 0,
  };
}

export interface SupportQueueResponse {
  results: SupportRequest[];
  summary: SupportQueueSummary;
}

export async function getSupportQueue(clientId?: string): Promise<SupportQueueResponse> {
  const data = await apiGet<{ results?: WireSupportRow[]; summary?: WireSummary }>(
    API.supportQueue,
    { clientId },
  );
  return {
    results: (data.results ?? []).map(normalizeSupportRow),
    summary: normalizeSummary(data.summary),
  };
}

export async function getSupportRequest(requestId: string): Promise<SupportRequest> {
  const raw = await apiGet<WireSupportRow>(API.supportRequest(requestId));
  return normalizeSupportRow(raw);
}

export function assignSupportRequest(requestId: string, owner: string) {
  return apiSend<SupportRequest>(API.supportRequestAction(requestId, "assign"), "POST", {
    owner,
  });
}

/** An escalation always carries a reason — the API rejects an empty one. */
export function escalateSupportRequest(requestId: string, reason: string) {
  return apiSend<SupportRequest>(API.supportRequestAction(requestId, "escalate"), "POST", {
    reason,
  });
}

export function resolveSupportRequest(requestId: string, resolution: string) {
  return apiSend<SupportRequest>(API.supportRequestAction(requestId, "resolve"), "POST", {
    resolution,
  });
}
