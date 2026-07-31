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
/**
 * The shipped backend serves `shell.for_subject` in snake_case — `shell_mode`,
 * `conversation_rail_sections`, a snake_case `conversation_header` — while the
 * dashboard's types (and the cockpit envelopes like `healthClasses`) are
 * camelCase. Normalise here, at the boundary, exactly once: keys are READ from
 * both casings and camelCase wins when both are present, so a future backend
 * that camelises does not get double-translated. The v7.1 Phase 3 alias
 * removal means `sidebar_sections` may be absent entirely; that is handled by
 * the fields simply staying undefined.
 */
function normalizeShell(raw: unknown): JourneyLead["shell"] {
  if (!raw || typeof raw !== "object") return undefined;
  const s = raw as Record<string, unknown>;
  const pick = <T,>(camel: string, snake: string): T | undefined =>
    (s[camel] ?? s[snake]) as T | undefined;

  const rawHeader = (s["conversationHeader"] ?? s["conversation_header"]) as
    | Record<string, unknown>
    | undefined;
  const h = rawHeader ?? {};

  return {
    threadId: pick("threadId", "thread_id") ?? null,
    shellMode: pick("shellMode", "shell_mode"),
    journeyState: pick("journeyState", "journey_state"),
    stateKey: pick("stateKey", "state_key"),
    identityState: pick("identityState", "identity_state"),
    disclosureCeiling: pick("disclosureCeiling", "disclosure_ceiling"),
    valueDelivered: pick("valueDelivered", "value_delivered"),
    composerLabel: pick("composerLabel", "composer_label"),
    questionLoopOpen: pick("questionLoopOpen", "question_loop_open"),
    attachmentsEnabled: pick("attachmentsEnabled", "attachments_enabled"),
    conversationRailSections: pick("conversationRailSections", "conversation_rail_sections"),
    contentPaneSections: pick("contentPaneSections", "content_pane_sections"),
    contentPaneDefaultArtifactId: pick(
      "contentPaneDefaultArtifactId",
      "content_pane_default_artifact_id",
    ),
    sidebarSections: pick("sidebarSections", "sidebar_sections"),
    conversationHeader: {
      title: ((h["title"] as string | undefined) ?? "") as string,
      stateLabel: ((h["stateLabel"] ?? h["state_label"] ?? "") as string),
      humanOwner: ((h["humanOwner"] ?? h["human_owner"] ?? null) as string | null),
      supportSla: ((h["supportSla"] ?? h["support_sla"] ?? null) as string | null),
      quickHelp: Boolean(h["quickHelp"] ?? h["quick_help"] ?? false),
    },
  } as JourneyLead["shell"];
}

export function normalizeJourney(raw: JourneyLead): JourneyLead {
  const state = normalizeState(raw.state);
  return {
    ...raw,
    state,
    journeyNumber: raw.journeyNumber ?? journeyNumber(state),
    stateKey: raw.stateKey ?? stateKey(state),
    successOverlayActive: raw.successOverlayActive ?? isSuccessOverlayActive(state),
    shell: normalizeShell(raw.shell),
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
