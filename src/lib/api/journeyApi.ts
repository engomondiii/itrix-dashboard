import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { JourneyEvent } from "@/constants/journeyStates";
import type {
  JourneyAdvanceResult,
  JourneyLead,
  JourneyMigrationReport,
  JourneyOverview,
} from "@/types/journey";

export function getJourney(leadId: string) {
  return apiGet<JourneyLead>(API.journeyLead(leadId));
}

export function getJourneyOverview() {
  return apiGet<JourneyOverview>(API.journeyOverview);
}

/** The ENGAGED-split dry run, reviewed before the data migration is applied. */
export function getJourneyMigrationReport() {
  return apiGet<JourneyMigrationReport>(API.journeyMigrationReport);
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
