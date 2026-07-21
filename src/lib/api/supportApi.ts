import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { SupportQueueSummary, SupportRequest } from "@/types/support";

export interface SupportQueueResponse {
  results: SupportRequest[];
  summary: SupportQueueSummary;
}

export function getSupportQueue(clientId?: string) {
  return apiGet<SupportQueueResponse>(API.supportQueue, { clientId });
}

export function getSupportRequest(requestId: string) {
  return apiGet<SupportRequest>(API.supportRequest(requestId));
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
