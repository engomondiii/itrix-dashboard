"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/ui/query-state";
import { usePersona } from "@/hooks/usePersonas";
import { FUNCTIONAL_FAMILY_LABEL } from "@/types/persona";

import { PitchRoomPreview } from "./PitchRoomPreview";
import { ValidationStatusBadge } from "./ValidationStatusBadge";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
        {label}
      </div>
      <div className="text-sec text-ink-primary">{children}</div>
    </div>
  );
}

/** One persona's blueprint. Team plane only — none of this reaches a visitor. */
export function PersonaDetail({ personaId }: { personaId: string }) {
  const query = usePersona(personaId);
  const persona = query.data;

  return (
    <div className="space-y-4">
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        hasData={Boolean(persona)}
        label="this persona"
      />

      {persona && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{persona.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">
                  {FUNCTIONAL_FAMILY_LABEL[persona.functionalFamily]}
                </Badge>
                <ValidationStatusBadge status={persona.validationStatus} />
                <code className="font-mono text-micro text-ink-secondary">{persona.id}</code>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Target department">
                  {persona.targetDepartment}
                  <p className="mt-1 text-caption text-ink-secondary">
                    A hypothesis about where this role sits — never stated to, or
                    confirmed with, a visitor.
                  </p>
                </Field>
                <Field label="Pitch archetype">{persona.pitchArchetype}</Field>
                <Field label="Decision lens">{persona.decisionLens}</Field>
                <Field label="Primary pain">{persona.primaryPain}</Field>
                <Field label="Likely objection">{persona.likelyObjection}</Field>
              </div>
            </CardContent>
          </Card>

          <PitchRoomPreview persona={persona} />
        </>
      )}
    </div>
  );
}
