import { apiGet, NotImplementedOnBackendError } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Persona, PersonaMatch } from "@/types/persona";

export async function getPersonas(family?: string): Promise<Persona[]> {
  const data = await apiGet<{ results: Persona[] }>(API.personas, { family });
  return data.results;
}

export function getPersona(personaId: string) {
  return apiGet<Persona>(API.persona(personaId));
}

/**
 * The persona hypothesis for a lead, or null when the matcher could not place
 * it. The route answers 204 in that case, so there is no body to parse —
 * `apiGet` would throw on `r.json()` of an empty response.
 */
export async function getPersonaMatch(leadId: string): Promise<PersonaMatch | null> {
  const r = await fetch(API.cockpitPersona(leadId), { cache: "no-store" });
  if (r.status === 204) return null;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    // Mirror `apiGet`'s handling — this fetcher is hand-rolled for the 204, so
    // it has to reproduce the 501 case rather than inherit it.
    if (r.status === 501 && body?.unimplemented) {
      throw new NotImplementedOnBackendError(body.detail, body.expectedEndpoint);
    }
    throw new Error(body?.detail ?? `Request failed (${r.status})`);
  }
  return (await r.json()) as PersonaMatch;
}
