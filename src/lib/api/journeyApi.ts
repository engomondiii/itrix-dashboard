import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { JourneyEvent } from "@/constants/journeyStates";
import type {
  JourneyAdvanceResult,
  JourneyLead,
  JourneyOverview,
} from "@/types/journey";

export function getJourney(leadId: string) {
  return apiGet<JourneyLead>(API.journeyLead(leadId));
}

export function getJourneyOverview() {
  return apiGet<JourneyOverview>(API.journeyOverview);
}

export function advanceJourney(
  leadId: string,
  event: JourneyEvent,
  meta?: Record<string, unknown>,
) {
  return apiSend<JourneyAdvanceResult>(API.journeyAdvance(leadId), "POST", {
    event,
    meta,
  });
}
