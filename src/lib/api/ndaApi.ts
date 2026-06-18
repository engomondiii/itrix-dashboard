import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { NDARecord } from "@/types/nda";

export function listNda() {
  return apiGet<{ results: NDARecord[]; count: number }>(API.nda);
}

export function getNda(leadId: string) {
  return apiGet<NDARecord>(API.ndaItem(leadId));
}

export function sendNda(leadId: string) {
  return apiSend<NDARecord>(API.ndaItem(leadId), "POST", { action: "send" });
}

export function signNda(leadId: string) {
  return apiSend<NDARecord>(API.ndaItem(leadId), "POST", { action: "sign" });
}

export function declineNda(leadId: string, reason: string) {
  return apiSend<NDARecord>(API.ndaItem(leadId), "POST", { action: "decline", reason });
}

export function expireNda(leadId: string) {
  return apiSend<NDARecord>(API.ndaItem(leadId), "POST", { action: "expire" });
}
