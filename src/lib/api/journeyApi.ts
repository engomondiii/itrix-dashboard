import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import {
  journeyNumber,
  normalizeState,
  stateKey,
  isSuccessOverlayActive,
  type JourneyEvent,
} from "@/constants/journeyStates";
import type {
  JourneyAdvanceResult,
  JourneyLead,
  JourneyMigrationReport,
  JourneyOverview,
} from "@/types/journey";

/**
 * Normalise a journey payload at the boundary.
 *
 * The running backend serves the v3-era shape: a `state` string and nothing
 * else from v6.0. Three things have to happen here rather than in components:
 *
 *  1. `state` goes through `normalizeState`, so a legacy value (CLIENT,
 *     ENGAGED) maps forward and an unknown one falls back to ARRIVED — the most
 *     restrictive state — instead of rendering `undefined` in a badge.
 *  2. `journeyNumber` and `stateKey` are DERIVED from the normalised state when
 *     the backend did not send them. They are pure functions of it, so deriving
 *     is always correct and never invents authority.
 *  3. `shell` is left ALONE. It cannot be derived — it encodes what the backend
 *     decided a visitor may see, and guessing at it would be exactly the kind of
 *     frontend self-authorization the architecture forbids. Absent means absent,
 *     and consumers must handle that.
 */
export function normalizeJourney(raw: JourneyLead): JourneyLead {
  const state = normalizeState(raw.state);
  return {
    ...raw,
    state,
    journeyNumber: raw.journeyNumber ?? journeyNumber(state),
    stateKey: raw.stateKey ?? stateKey(state),
    successOverlayActive: raw.successOverlayActive ?? isSuccessOverlayActive(state),
    transitions: raw.transitions ?? [],
  };
}

export async function getJourney(leadId: string) {
  return normalizeJourney(await apiGet<JourneyLead>(API.journeyLead(leadId)));
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
