import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { AgentRunRecord, ApprovalRequest } from "@/types/agent";

export function listApprovalQueue() {
  return apiGet<ApprovalRequest[]>(API.agentApprovalQueue);
}

export function listAgentRuns() {
  return apiGet<AgentRunRecord[]>(API.agentRuns);
}

export function approveDraft(id: string, body?: string) {
  return apiSend<ApprovalRequest>(
    API.agentApprovalAction(id, "approve"),
    "POST",
    body ? { body } : {},
  );
}

export function editDraft(id: string, body: string) {
  return apiSend<ApprovalRequest>(API.agentApprovalAction(id, "edit"), "POST", {
    body,
  });
}

export function rejectDraft(id: string, reason?: string) {
  return apiSend<ApprovalRequest>(API.agentApprovalAction(id, "reject"), "POST", {
    reason,
  });
}
