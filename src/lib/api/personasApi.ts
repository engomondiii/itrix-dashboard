import {
  apiGet,
  NotImplementedOnBackendError,
  rememberUnimplementedEndpoint,
  throwIfKnownUnimplemented,
} from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Persona, PersonaMatch } from "@/types/persona";

/**
 * BOUNDARY NORMALISATION (same rule as the customers normaliser — BACKEND_GAPS
 * §4): the shipped `apps/personas` serializers answer a different shape than
 * the one this surface was built against. The list envelope is
 * `{ personas, total }` rather than the DRF-style `{ results }`, and the row
 * speaks workbook vocabulary — `personaId`, `company`, `department`,
 * `primary_persona` — where the surface types say `id`, `targetDepartment`,
 * `title`. Casting the wire read unchecked made the whole registry page fail on
 * a request that had in fact succeeded.
 *
 * `personaId` ("P-001") is the canonical id on this plane: the detail route
 * looks personas up by it, so it is what `ROUTES.persona()` must link with.
 * Blueprint fields the summary row does not carry stay empty and only the
 * detail read fills them; nothing is fabricated.
 */

interface WirePersonaRow {
  id: string;
  personaId: string;
  company?: string;
  department?: string;
  primary_persona?: string;
  functionalFamily: Persona["functionalFamily"];
  pitchArchetype?: string;
  priority?: number;
  validationStatus: Persona["validationStatus"];
  pitchRoomId?: string | null;
}

interface WirePersonaDetail extends WirePersonaRow {
  decisionLens?: string;
  boundaryWasteHypothesis?: string;
  likelyObjection?: string;
  pitchRoom?: { pitchRoomId?: string; slideCount?: number } | null;
}

function normalizePersona(raw: Partial<WirePersonaDetail>): Persona {
  return {
    id: raw.personaId ?? String(raw.id ?? ""),
    title: [raw.company, raw.primary_persona].filter(Boolean).join(" — "),
    functionalFamily: raw.functionalFamily as Persona["functionalFamily"],
    targetDepartment: raw.department ?? "",
    pitchArchetype: raw.pitchArchetype ?? "",
    decisionLens: raw.decisionLens ?? "",
    // The registry models "primary pain" as the boundary-waste hypothesis.
    primaryPain: raw.boundaryWasteHypothesis ?? "",
    likelyObjection: raw.likelyObjection ?? "",
    validationStatus: raw.validationStatus ?? "hypothesis",
    pitchRoomId: raw.pitchRoomId ?? raw.pitchRoom?.pitchRoomId ?? null,
    slideCount: raw.pitchRoom?.slideCount ?? 0,
  };
}

export async function getPersonas(family?: string): Promise<Persona[]> {
  const data = await apiGet<{ personas: WirePersonaRow[] }>(API.personas, { family });
  return (data.personas ?? []).map(normalizePersona);
}

export async function getPersona(personaId: string): Promise<Persona> {
  const raw = await apiGet<WirePersonaDetail>(API.persona(personaId));
  return normalizePersona(raw);
}

/**
 * The persona hypothesis for a lead, or null when the matcher could not place
 * it. The route answers 204 in that case, so there is no body to parse —
 * `apiGet` would throw on `r.json()` of an empty response.
 */
export async function getPersonaMatch(leadId: string): Promise<PersonaMatch | null> {
  const url = API.cockpitPersona(leadId);
  throwIfKnownUnimplemented(url);

  const r = await fetch(url, { cache: "no-store" });
  if (r.status === 204) return null;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    // Mirror `apiGet`'s handling — this fetcher is hand-rolled for the 204, so
    // it has to reproduce the 501 case rather than inherit it.
    if (r.status === 501 && body?.unimplemented) {
      const error = new NotImplementedOnBackendError(body.detail, body.expectedEndpoint);
      rememberUnimplementedEndpoint(url, error);
      throw error;
    }
    throw new Error(body?.detail ?? `Request failed (${r.status})`);
  }
  return (await r.json()) as PersonaMatch;
}
