"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { usePersonaMatch } from "@/hooks/usePersonas";
import { ROUTES } from "@/constants/routes";
import { FUNCTIONAL_FAMILY_LABEL } from "@/types/persona";

import { PersonaMatchBadge } from "./PersonaMatchBadge";
import { ValidationStatusBadge } from "./ValidationStatusBadge";

/**
 * The persona hypothesis for one lead.
 *
 * INTERNAL-ONLY, AND EMPHATICALLY A HYPOTHESIS. The visitor is never told a
 * match happened, never shown a persona name, and never has a department
 * confirmed back to them. This panel exists so a concierge can prepare the room
 * — the framing, the likely objection, the decision lens — not so anyone can
 * tell the visitor what we think we know about them.
 *
 * NO MATCH IS A REAL ANSWER. When the matcher could not place a lead, the panel
 * says so rather than falling back to a default persona: an unfounded
 * hypothesis presented in the same frame as a real one is worse than nothing,
 * because the operator will prepare around it either way.
 */
export function PersonaPanel({ leadId }: { leadId: string }) {
  const { data: match, isLoading, isError } = usePersonaMatch(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matched persona</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="neutral">Hypothesis — never shown to the visitor</Badge>

        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner className="size-4" />
          </div>
        )}

        {isError && !isLoading && (
          <p className="text-sec text-ink-secondary">Persona data isn’t available yet.</p>
        )}

        {!isLoading && !isError && !match && (
          <p className="text-sec text-ink-secondary">
            No persona matched. The Pitch Agent will fall back to the generic template,
            and the chosen path is recorded on the AgentRun.
          </p>
        )}

        {match && (
          <>
            <div>
              <Link
                href={ROUTES.persona(match.persona.id)}
                className="text-card-title font-semibold text-ink-primary hover:underline"
              >
                {match.persona.title}
              </Link>
              <p className="text-caption text-ink-secondary">
                {FUNCTIONAL_FAMILY_LABEL[match.persona.functionalFamily]} ·{" "}
                {match.persona.pitchArchetype}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PersonaMatchBadge match={match} />
              <ValidationStatusBadge status={match.persona.validationStatus} />
            </div>

            <dl className="space-y-1.5 text-sec">
              <div>
                <dt className="font-medium text-ink-primary">Decision lens</dt>
                <dd className="text-ink-secondary">{match.persona.decisionLens}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-primary">Likely objection</dt>
                <dd className="text-ink-secondary">{match.persona.likelyObjection}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-primary">Target department</dt>
                <dd className="text-ink-secondary">
                  {match.persona.targetDepartment} — a hypothesis about the role, not a
                  fact about this person.
                </dd>
              </div>
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
