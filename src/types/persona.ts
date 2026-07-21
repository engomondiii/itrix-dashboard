/**
 * The target-account persona registry (Backend v6.0 §1.3 `apps/personas`).
 *
 * INTERNAL-ONLY IN ITS ENTIRETY. `persona_id` is on the serializer deny-list for
 * every anonymous and client-plane payload (Architecture v2.6 §10.5), it never
 * appears in a turn, artifact, card or generated question, and the visitor is
 * never told a match happened. Personalization means the framing and emphasis
 * are tailored; it never means telling someone what we think we know about them.
 *
 * A DEPARTMENT IS A HYPOTHESIS. The registry records the department a persona is
 * expected to sit in, seeded from the 60-persona workbook. That is an
 * expectation, not a fact about any individual, which is why
 * `validationStatus` exists and why the cockpit labels it as a hypothesis
 * everywhere it is rendered.
 */

/** The five functional families that organise the 60-persona workbook. */
export const FUNCTIONAL_FAMILIES = [
  "ai_model_systems",
  "cloud_infrastructure",
  "silicon_memory_hardware",
  "runtime_hpc_simulation",
  "strategic_product_partnerships",
] as const;
export type FunctionalFamily = (typeof FUNCTIONAL_FAMILIES)[number];

export const FUNCTIONAL_FAMILY_LABEL: Record<FunctionalFamily, string> = {
  ai_model_systems: "AI & Model Systems",
  cloud_infrastructure: "Cloud & Infrastructure",
  silicon_memory_hardware: "Silicon, Memory & Hardware",
  runtime_hpc_simulation: "Runtime, HPC & Simulation",
  strategic_product_partnerships: "Strategic Product & Partnerships",
};

/** One pitch archetype per family — 12 personas each (Architecture v2.6 §2.2). */
export const FAMILY_PITCH_ARCHETYPE: Record<FunctionalFamily, string> = {
  ai_model_systems: "Model economics & capability",
  cloud_infrastructure: "AI factory TCO & capacity",
  silicon_memory_hardware: "Silicon / memory co-design",
  runtime_hpc_simulation: "Runtime transformation & numerical proof",
  strategic_product_partnerships: "Platform differentiation & license pathway",
};

/**
 * How much confidence the registry has in this persona's blueprint.
 *
 * `hypothesis` is the honest default for a seeded row nobody has tested against
 * a real conversation yet. It is surfaced rather than hidden so an operator
 * never reads a seeded guess as a researched finding.
 */
export type PersonaValidationStatus = "validated" | "provisional" | "hypothesis";

export const VALIDATION_STATUS_LABEL: Record<PersonaValidationStatus, string> = {
  validated: "Validated",
  provisional: "Provisional",
  hypothesis: "Hypothesis",
};

export interface Persona {
  /** `persona_id` — joined to the Lead by a nullable FK. Never leaves this plane. */
  id: string;
  title: string;
  functionalFamily: FunctionalFamily;
  /** Expected department. A hypothesis — see the module note. */
  targetDepartment: string;
  pitchArchetype: string;
  /** What this buyer optimises for. Used to prepare the room, not to score them. */
  decisionLens: string;
  primaryPain: string;
  likelyObjection: string;
  validationStatus: PersonaValidationStatus;
  /** The pitch room this persona resolves to, if one is built. */
  pitchRoomId: string | null;
  slideCount: number;
}

/** Lightweight row for the registry table. */
export type PersonaListItem = Pick<
  Persona,
  | "id"
  | "title"
  | "functionalFamily"
  | "targetDepartment"
  | "pitchArchetype"
  | "validationStatus"
>;

/**
 * A persona match on a lead.
 *
 * `confidence` is the matcher's own score, not the lead score. An exact
 * `persona_id` match beats a functional-family match beats a generic template
 * (Architecture v2.6 §12.3), and which path was taken is recorded on the
 * AgentRun — so `matchPath` is auditable rather than inferred.
 */
export interface PersonaMatch {
  persona: Persona;
  matchPath: "exact" | "family" | "generic";
  confidence: number;
}
