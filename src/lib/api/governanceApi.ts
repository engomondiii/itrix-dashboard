import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { ApprovalRequest } from "@/types/agent";
import type { ClaimCard, ClaimCardInput } from "@/types/claimCard";

export function listClaimCards(level?: number) {
  return apiGet<ClaimCard[]>(API.governanceClaimCards, level ? { level } : undefined);
}

export function getClaimCard(id: string) {
  return apiGet<ClaimCard>(API.governanceClaimCard(id));
}

export function createClaimCard(input: ClaimCardInput) {
  return apiSend<ClaimCard>(API.governanceClaimCards, "POST", input);
}

export function updateClaimCard(id: string, patch: Partial<ClaimCardInput>) {
  return apiSend<ClaimCard>(API.governanceClaimCard(id), "PATCH", patch);
}

export function listGovernanceAudit(status?: string) {
  return apiGet<ApprovalRequest[]>(API.governanceAudit, status ? { status } : undefined);
}
