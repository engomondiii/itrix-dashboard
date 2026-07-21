/**
 * The closed artifact vocabulary.
 *
 * Mirrored from `apps/journey/constants.py` (ARTIFACT_TYPES) and identical to
 * itrix-web's `src/lib/journey/artifactTypes.ts`. It is NEVER re-decided here —
 * an artifact type this build does not know about renders nothing and logs.
 *
 * An artifact is a governed, structured payload delivered INTO a thread. It is
 * not a page the visitor is sent to (Architecture v2.6 §2.5). Surface 2 renders
 * artifacts as rows in the operator's view of a transcript: what was delivered,
 * at what disclosure level, and whether it has since been superseded.
 *
 * REGENERATION SUPERSEDES RATHER THAN OVERWRITES. `superseded_by` preserves the
 * audit trail, so an operator can always see what a visitor was shown at the
 * time — not just what the latest version says (Backend v6.0 §3.3).
 */

export const ARTIFACT_TYPES = [
  "reflection", // State 3
  "pitch_room", // State 4
  "review_summary", // State 5
  "boundary_waste_map", // State 7
  "poc_evidence", // State 8
  "integration_readiness", // State 9
  "success_overview", // State 10
  "document", // any state, once authorized
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

const KNOWN: ReadonlySet<string> = new Set(ARTIFACT_TYPES);

export function isArtifactType(value: string): value is ArtifactType {
  return KNOWN.has(value);
}

/** Operator-facing labels. The visitor-facing titles differ — Playbook v1.6 Part IV. */
export const ARTIFACT_TYPE_LABEL: Record<ArtifactType, string> = {
  reflection: "Reflection",
  pitch_room: "Pitch room",
  review_summary: "Review summary",
  boundary_waste_map: "Boundary Waste Map",
  poc_evidence: "PoC evidence",
  integration_readiness: "Integration readiness",
  success_overview: "Success overview",
  document: "Document",
};

/** The journey state each artifact type belongs to, for ordering and sanity checks. */
export const ARTIFACT_STATE: Record<ArtifactType, number | null> = {
  reflection: 3,
  pitch_room: 4,
  review_summary: 5,
  boundary_waste_map: 7,
  poc_evidence: 8,
  integration_readiness: 9,
  success_overview: 10,
  document: null, // any state, once authorized
};
