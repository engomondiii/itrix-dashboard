import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { AccountListItem, ResendVerificationResult } from "@/types/account";

export async function getAccounts(): Promise<AccountListItem[]> {
  const data = await apiGet<{ results: AccountListItem[] }>(API.cockpitAccounts);
  return data.results;
}

export function resendVerification(clientId: string, reason: string) {
  return apiSend<ResendVerificationResult>(
    API.cockpitAccountResendVerification(clientId),
    "POST",
    { reason },
  );
}
