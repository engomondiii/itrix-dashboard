'use client';

/**
 * Library data: message templates (full CRUD; `variables` is server-derived
 * from {{placeholders}} on save) and the buyer-profile registry (read-only,
 * seeded from the persona workbook — INTERNAL ONLY, never customer-facing).
 *
 * Envelope quirks: templates = {results, count}; personas = {personas, total}.
 * Persona rows are camelCase except `primary_persona` (snake, verbatim).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { http } from '@/lib/api/client';
import type { ResultsEnvelope } from '@/lib/today/types';

const V1 = '/api/v1';

export type TemplateKind = 'email' | 'follow-up' | 'evaluation' | 'poc' | 'handoff';

export interface MessageTemplate {
  id: string;
  kind: TemplateKind;
  name: string;
  body: string;
  variables: string[];
  updatedAt: string;
}

export interface PersonaSummary {
  id: string;
  personaId: string;
  company: string;
  department: string;
  primary_persona: string;
  functionalFamily: string;
  pitchArchetype: string;
  priority: number;
  validationStatus: string;
  pitchRoomId: string | null;
}

export interface PersonaDetail extends PersonaSummary {
  decisionLens: string;
  departmentMandate: string;
  triggerEvent: string;
  primaryKpi: string;
  supportingKpis: string[];
  workloadEnvironment: string;
  boundaryWasteHypothesis: string;
  desiredGain: string;
  likelyChampion: string;
  likelyBlocker: string;
  likelyObjection: string;
  responseAngle: string;
  disclosureCeiling: string;
  pitchRoom?: { id: string; pitchRoomId: string; title: string; slideCount: number; reviewStatus: string } | null;
}

export function useTemplates(kind: TemplateKind) {
  return useQuery({
    queryKey: ['library', 'templates', kind],
    queryFn: () =>
      http.get<ResultsEnvelope<MessageTemplate>>(`${V1}/templates/?kind=${kind}`),
  });
}

export function useSaveTemplate(kind: TemplateKind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id?: string; name: string; body: string }) =>
      vars.id
        ? http.patch<MessageTemplate>(`${V1}/templates/${vars.id}/`, { name: vars.name, body: vars.body })
        : http.post<MessageTemplate>(`${V1}/templates/`, { kind, name: vars.name, body: vars.body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'templates'] }),
  });
}

export function usePersonas() {
  return useQuery({
    queryKey: ['library', 'personas'],
    queryFn: () => http.get<{ personas: PersonaSummary[]; total: number }>(`${V1}/personas/`),
  });
}

export function usePersona(personaId: string | null) {
  return useQuery({
    queryKey: ['library', 'personas', personaId],
    queryFn: () => http.get<PersonaDetail>(`${V1}/personas/${personaId}/`),
    enabled: personaId !== null,
  });
}
