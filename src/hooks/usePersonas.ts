"use client";

import { useQuery } from "@tanstack/react-query";

import { getPersona, getPersonaMatch, getPersonas } from "@/lib/api/personasApi";

/**
 * The persona registry is seeded from the workbook and changes only when
 * `seed_personas` is re-run, so it is cached hard rather than refetched on
 * every mount.
 */
const REGISTRY_STALE_TIME = 10 * 60_000;

export function usePersonas(family?: string) {
  return useQuery({
    queryKey: ["personas", family ?? "all"],
    queryFn: () => getPersonas(family),
    staleTime: REGISTRY_STALE_TIME,
  });
}

export function usePersona(personaId: string) {
  return useQuery({
    queryKey: ["persona", personaId],
    queryFn: () => getPersona(personaId),
    enabled: Boolean(personaId),
    staleTime: REGISTRY_STALE_TIME,
  });
}

/**
 * The persona hypothesis for a lead. Resolves to `null` — not an error — when
 * the matcher could not place the lead, because "no hypothesis" is a normal and
 * meaningful answer that the cockpit renders differently from a failure.
 */
export function usePersonaMatch(leadId: string) {
  return useQuery({
    queryKey: ["persona-match", leadId],
    queryFn: () => getPersonaMatch(leadId),
    enabled: Boolean(leadId),
  });
}
