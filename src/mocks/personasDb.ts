import "server-only";

import {
  FAMILY_PITCH_ARCHETYPE,
  FUNCTIONAL_FAMILIES,
  type FunctionalFamily,
  type Persona,
  type PersonaMatch,
  type PersonaValidationStatus,
} from "@/types/persona";
import { getLead } from "@/mocks/leadsDb";

/**
 * Mock persona registry, standing in for `seed_personas` + `personas_60.json`.
 *
 * Twelve personas per functional family, sixty in total, matching the shape of
 * the target-account workbook. The titles below are representative role titles,
 * not the real workbook contents — the workbook is confidential and is not
 * checked into a frontend repo. What matters for Surface 2 is that the registry
 * browser renders the real STRUCTURE: family, department hypothesis, pitch
 * archetype and validation status.
 */

/** Twelve role titles per family. */
const TITLES: Record<FunctionalFamily, readonly string[]> = {
  ai_model_systems: [
    "VP of AI Infrastructure",
    "Head of Model Training",
    "Director of ML Platform",
    "Principal Research Engineer",
    "Head of Inference Systems",
    "Chief AI Officer",
    "Director of Model Efficiency",
    "Head of Foundation Models",
    "VP of Applied Research",
    "Lead MLOps Architect",
    "Head of Model Serving",
    "Director of AI Economics",
  ],
  cloud_infrastructure: [
    "VP of Cloud Infrastructure",
    "Head of Data Centre Engineering",
    "Director of Capacity Planning",
    "Chief Infrastructure Architect",
    "Head of Platform Reliability",
    "Director of Compute Procurement",
    "VP of Cloud Economics",
    "Head of Power and Cooling",
    "Principal Systems Architect",
    "Director of Fleet Operations",
    "Head of Storage Systems",
    "VP of Technical Operations",
  ],
  silicon_memory_hardware: [
    "VP of Silicon Engineering",
    "Director of Memory Systems",
    "Chief Hardware Architect",
    "Head of SoC Design",
    "Director of Firmware and Runtime",
    "Principal Memory Architect",
    "Head of Accelerator Programs",
    "VP of Hardware Software Co-design",
    "Director of Compiler Engineering",
    "Head of Device Enablement",
    "Principal Interconnect Architect",
    "VP of Product Silicon",
  ],
  runtime_hpc_simulation: [
    "Director of HPC",
    "Head of Scientific Computing",
    "Principal Numerical Analyst",
    "Head of Simulation Engineering",
    "Director of Solver Development",
    "Chief Computational Scientist",
    "Head of CAE Platform",
    "VP of Engineering Simulation",
    "Principal Performance Engineer",
    "Head of Research Computing",
    "Director of Numerical Methods",
    "Head of Reproducibility and Validation",
  ],
  strategic_product_partnerships: [
    "Chief Technology Officer",
    "VP of Corporate Development",
    "Head of Strategic Partnerships",
    "Director of Technology Licensing",
    "Chief Strategy Officer",
    "Head of Ventures",
    "VP of Product Strategy",
    "Director of Alliances",
    "Head of IP Strategy",
    "Managing Director, Technology Investments",
    "VP of Business Development",
    "Head of Innovation",
  ],
};

const DEPARTMENTS: Record<FunctionalFamily, string> = {
  ai_model_systems: "AI / ML Engineering",
  cloud_infrastructure: "Infrastructure & Cloud Platform",
  silicon_memory_hardware: "Silicon & Hardware Engineering",
  runtime_hpc_simulation: "HPC & Scientific Computing",
  strategic_product_partnerships: "Strategy & Corporate Development",
};

const DECISION_LENS: Record<FunctionalFamily, string> = {
  ai_model_systems: "Cost per useful token, and capability headroom at the same spend.",
  cloud_infrastructure: "Capacity delivered per watt and per rack, against committed SLAs.",
  silicon_memory_hardware: "Whether the software path makes the silicon competitive.",
  runtime_hpc_simulation: "Time to a trustworthy answer — speed is worthless if it is unstable.",
  strategic_product_partnerships: "Defensibility, and what the partnership forecloses to rivals.",
};

const PRIMARY_PAIN: Record<FunctionalFamily, string> = {
  ai_model_systems: "Training and inference cost rising faster than the value produced.",
  cloud_infrastructure: "Memory movement, power or cooling limiting usable capacity.",
  silicon_memory_hardware: "Strong silicon held back by a weak software and runtime path.",
  runtime_hpc_simulation: "Solvers that are slow, numerically unstable, or hard to reproduce.",
  strategic_product_partnerships: "Evaluating a technical, licensing or strategic partnership.",
};

const LIKELY_OBJECTION: Record<FunctionalFamily, string> = {
  ai_model_systems: "“We have already optimised this — what could you find that we did not?”",
  cloud_infrastructure: "“We cannot risk a change to a fleet that is carrying production load.”",
  silicon_memory_hardware: "“Our runtime team owns this; where does an external party fit?”",
  runtime_hpc_simulation: "“Show me it is numerically identical before we discuss speed.”",
  strategic_product_partnerships: "“What stops a larger incumbent doing this themselves?”",
};

/**
 * Validation status by position in the family.
 *
 * The first few personas per family are the ones real conversations have
 * touched, so the registry degrades honestly from validated to hypothesis
 * rather than presenting sixty equally-confident rows.
 */
function validationFor(index: number): PersonaValidationStatus {
  if (index < 3) return "validated";
  if (index < 7) return "provisional";
  return "hypothesis";
}

function buildPersonas(): Persona[] {
  const out: Persona[] = [];
  for (const family of FUNCTIONAL_FAMILIES) {
    TITLES[family].forEach((title, i) => {
      const validationStatus = validationFor(i);
      out.push({
        id: `${family}-${String(i + 1).padStart(2, "0")}`,
        title,
        functionalFamily: family,
        targetDepartment: DEPARTMENTS[family],
        pitchArchetype: FAMILY_PITCH_ARCHETYPE[family],
        decisionLens: DECISION_LENS[family],
        primaryPain: PRIMARY_PAIN[family],
        likelyObjection: LIKELY_OBJECTION[family],
        validationStatus,
        // Only a validated persona has a built room; the rest resolve to the
        // family template, which is exactly what the matcher does.
        pitchRoomId: validationStatus === "validated" ? `pr-${family}-${i + 1}` : null,
        slideCount: validationStatus === "validated" ? 6 : 5,
      });
    });
  }
  return out;
}

export const MOCK_PERSONAS: readonly Persona[] = buildPersonas();

export function listPersonas(family?: string): Persona[] {
  if (!family) return [...MOCK_PERSONAS];
  return MOCK_PERSONAS.filter((p) => p.functionalFamily === family);
}

export function getPersona(personaId: string): Persona | null {
  return MOCK_PERSONAS.find((p) => p.id === personaId) ?? null;
}

/**
 * The persona hypothesis for a lead.
 *
 * Mirrors the matcher's precedence — exact `persona_id` → functional family →
 * generic template. The family is derived from the strongest available signal:
 * a commercial intent that is plainly strategic wins outright, otherwise the
 * workload names the family, otherwise the product route does.
 *
 * A lead with no usable signal gets NO match rather than a default one. An
 * unfounded persona is worse than none here, because the cockpit would present
 * a guess with the same visual weight as a finding — and the operator would
 * prepare the room around it.
 */
const INTENT_IS_STRATEGIC: ReadonlySet<string> = new Set([
  "Field-of-use licensing",
  "Strategic investment",
  "Acquisition / partnership",
]);

const WORKLOAD_TO_FAMILY: Record<string, FunctionalFamily> = {
  "AI inference / training infrastructure": "ai_model_systems",
  "Tensor / high-dimensional algebra": "ai_model_systems",
  "Conservation-law simulation": "runtime_hpc_simulation",
  "Scientific simulation": "runtime_hpc_simulation",
  "Complex-valued linear algebra": "runtime_hpc_simulation",
  "Runtime / compiler pipeline": "runtime_hpc_simulation",
  "Semiconductor process simulation": "silicon_memory_hardware",
  "Edge / robotics workload": "cloud_infrastructure",
};

const ROUTE_TO_FAMILY: Record<string, FunctionalFamily> = {
  "ALPHA Compute": "cloud_infrastructure",
  "ALPHA Core": "silicon_memory_hardware",
  Both: "strategic_product_partnerships",
};

function familyForLead(
  workloadType: string,
  productRoute: string,
  commercialIntent: string,
): FunctionalFamily | null {
  if (INTENT_IS_STRATEGIC.has(commercialIntent)) return "strategic_product_partnerships";
  return WORKLOAD_TO_FAMILY[workloadType] ?? ROUTE_TO_FAMILY[productRoute] ?? null;
}

export function getPersonaMatch(leadId: string): PersonaMatch | null {
  const lead = getLead(leadId);
  if (!lead) return null;

  const family = familyForLead(lead.workloadType, lead.productRoute, lead.commercialIntent);
  if (!family) return null;

  const candidates = MOCK_PERSONAS.filter((p) => p.functionalFamily === family);
  if (candidates.length === 0) return null;

  // Deterministic pick so a lead's hypothesis does not change between reads.
  const index = Math.abs(hash(leadId)) % candidates.length;
  const persona = candidates[index];

  return {
    persona,
    matchPath: persona.validationStatus === "validated" ? "exact" : "family",
    confidence: persona.validationStatus === "validated" ? 82 : 54,
  };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}
