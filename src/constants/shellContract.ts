/**
 * The shell contract vocabulary — what Surface 1 is authorized to render.
 *
 * Backend v6.0 §3.1 replaced `services/rails.py` with `services/shell.py`:
 * `left_rail` / `right_rail` are gone and `sidebar_sections`,
 * `conversation_header` and `composer_label` take their place. The right value
 * rail is retired entirely; the left rail became navigation.
 *
 * WHY THIS LIVES IN THE DASHBOARD AT ALL. Surface 2 never renders a sidebar for
 * a visitor. It renders what the visitor's sidebar WOULD contain, so an
 * operator can answer "what can this person actually see right now?" without
 * guessing — which is the whole point of `SidebarContractPanel`. Getting that
 * answer wrong in either direction is a governance problem, so the vocabulary
 * is mirrored from `apps/journey/constants.py` exactly as itrix-web mirrors it,
 * and is never re-decided here.
 *
 * Surface 2 v5.0 §00.1 item 7 · Architecture v2.6 §11.6, §11.7
 */

import { JOURNEY_NUMBER, type JourneyState } from "@/constants/journeyStates";

/* ── Sidebar sections ─────────────────────────────────────────────────────── */

/** Present at every state, for every identity. Orientation and policy access. */
export const BASE_SIDEBAR_SECTIONS = [
  "brand_nav",
  "new_review",
  "conversations",
  "explore",
  "legal",
] as const;

/** Added as the relationship becomes real. Authorized by the backend, never here. */
export const GROWTH_SIDEBAR_SECTIONS = [
  "documents",
  "pathway",
  "nda",
  "workspace_assessment",
  "workspace_poc",
  "workspace_integration",
  "decisions",
  "governance",
  "outcomes",
  "deployments",
  "support",
  "knowledge",
  "meetings",
  "feedback",
] as const;

export const SIDEBAR_SECTIONS = [
  ...BASE_SIDEBAR_SECTIONS,
  ...GROWTH_SIDEBAR_SECTIONS,
] as const;

export type SidebarSectionKey = (typeof SIDEBAR_SECTIONS)[number];

const KNOWN_SECTIONS: ReadonlySet<string> = new Set(SIDEBAR_SECTIONS);

export function isSidebarSection(key: string): key is SidebarSectionKey {
  return KNOWN_SECTIONS.has(key);
}

/** Operator-facing labels. The visitor-facing copy lives in Playbook v1.6 §16C. */
export const SIDEBAR_SECTION_LABEL: Record<SidebarSectionKey, string> = {
  brand_nav: "Brand + navigation",
  new_review: "New review",
  conversations: "Conversations",
  explore: "Explore itriX",
  legal: "Legal",
  documents: "Documents",
  pathway: "Your pathway",
  nda: "NDA",
  workspace_assessment: "Assessment",
  workspace_poc: "PoC",
  workspace_integration: "Integration",
  decisions: "Decisions",
  governance: "Decision log",
  outcomes: "Outcomes",
  deployments: "Deployments",
  support: "Support",
  knowledge: "Learning",
  meetings: "Meetings",
  feedback: "Feedback",
};

/**
 * Sidebar growth by state (Backend v6.0 §3.2).
 *
 * States 2–3 add NOTHING — the thread itself carries the memory. The v3.0
 * left-rail memory sections (heard, reflection, pitch_slides, open_questions,
 * meeting_notes) are retired: that content is the transcript now, which is the
 * actual record rather than a summary of one.
 *
 * The sidebar's SECTIONS grow with state. Its width does not.
 */
export function sectionsForState(journeyState: number | null | undefined): SidebarSectionKey[] {
  const n = journeyState ?? 1;
  const out: SidebarSectionKey[] = [...BASE_SIDEBAR_SECTIONS];
  if (n >= 4) out.push("documents", "pathway");
  if (n >= 6) out.push("nda");
  if (n >= 7) out.push("workspace_assessment", "decisions");
  if (n >= 8) out.push("workspace_poc");
  if (n >= 9) out.push("workspace_integration", "governance");
  if (n >= 10) {
    out.push("outcomes", "deployments", "support", "knowledge", "meetings", "feedback");
  }
  return out;
}

/* ── Identity and disclosure ──────────────────────────────────────────────── */

export const IDENTITY_STATES = ["anonymous", "identified", "authenticated_customer"] as const;
export type IdentityState = (typeof IDENTITY_STATES)[number];

export const IDENTITY_STATE_LABEL: Record<IdentityState, string> = {
  anonymous: "Anonymous",
  identified: "Identified",
  authenticated_customer: "Authenticated customer",
};

/**
 * The six disclosure tiers (Architecture v2.6 §10.1, Backend v6.0 §8.1).
 * `prohibited` is never a ceiling — it is never embedded or indexed at all, so
 * it cannot be reached on any plane and is deliberately absent from this list.
 */
export const DISCLOSURE_CEILINGS = [
  "public",
  "controlled_public",
  "nda_only",
  "customer_contract",
  "internal",
] as const;
export type DisclosureCeiling = (typeof DISCLOSURE_CEILINGS)[number];

export const DISCLOSURE_CEILING_LABEL: Record<DisclosureCeiling, string> = {
  public: "Public",
  controlled_public: "Controlled public",
  nda_only: "NDA only",
  customer_contract: "Customer contract",
  internal: "Internal",
};

/**
 * The ceiling a state carries, derived the way the backend derives it: from the
 * identity plane and NDA/contract state, never chosen by a surface.
 */
export const STATE_CEILING: Record<JourneyState, DisclosureCeiling> = {
  ARRIVED: "public",
  IN_REVIEW: "controlled_public",
  DIAGNOSED: "controlled_public",
  CLIENT_PAGE: "controlled_public",
  INVITED: "controlled_public",
  NDA_REVIEW: "nda_only",
  ASSESSMENT: "nda_only",
  POC: "nda_only",
  INTEGRATION: "nda_only",
  CUSTOMER_SUCCESS: "customer_contract",
  DORMANT: "public",
};

/* ── Composer ─────────────────────────────────────────────────────────────── */

/**
 * The composer is invariant — one component at every state, only its label
 * changes (Architecture v2.6 §16.3). There is no "Begin review" button and no
 * character counter anywhere in the ten states.
 */
export function composerLabelForState(state: JourneyState): string {
  const n = JOURNEY_NUMBER[state];
  if (n === 1) return "What would you like computation to do better?";
  if (n === 10) return "What can we improve for you?";
  return "Ask itriX";
}
