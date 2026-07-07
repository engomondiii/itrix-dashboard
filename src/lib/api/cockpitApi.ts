import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { AgentRunResult } from "@/types/agent";
import type { CockpitLead, CockpitNextAction, PitchAnalytics } from "@/types/cockpit";

export function getCockpit(leadId: string) {
  return apiGet<CockpitLead>(API.cockpitLead(leadId));
}

export function getNextAction(leadId: string) {
  return apiGet<CockpitNextAction>(API.cockpitNextAction(leadId));
}

export function runAgent(key: string, leadId: string) {
  return apiSend<AgentRunResult>(API.agentRun(key), "POST", { lead_id: leadId });
}

export function getPitchAnalytics(days?: number) {
  return apiGet<PitchAnalytics>(API.analyticsPitch, days ? { days } : undefined);
}
