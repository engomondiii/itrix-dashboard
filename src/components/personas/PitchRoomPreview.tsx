import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Persona } from "@/types/persona";

/**
 * Which pitch room this persona resolves to.
 *
 * The resolver's precedence is exact persona → functional family → generic
 * template (Architecture v2.6 §12.3). A persona with no built room is not
 * broken — it falls through to the family template, and saying so plainly is
 * more useful than an empty panel.
 *
 * SLIDE BODIES ARE NOT RENDERED HERE. Each slide carries its own claim ceiling
 * and is governed per slide at generation time; showing approved copy out of
 * that context invites an operator to paste it somewhere it was never cleared
 * for. The preview reports structure, not content.
 */
export function PitchRoomPreview({ persona }: { persona: Persona }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pitch room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {persona.pitchRoomId ? (
          <>
            <p className="text-sec text-ink-primary">
              Resolves to a dedicated room —{" "}
              <code className="font-mono text-micro text-ink-secondary">
                {persona.pitchRoomId}
              </code>
              , {persona.slideCount} slides.
            </p>
            <p className="text-caption text-ink-secondary">
              Delivered as an in-thread artifact at State 4, and emailable under a
              capability token. Slide copy is governed per slide and is not
              reproduced here.
            </p>
          </>
        ) : (
          <>
            <p className="text-sec text-ink-primary">
              No dedicated room — falls through to the{" "}
              <strong className="font-semibold">{persona.pitchArchetype}</strong> family
              template.
            </p>
            <p className="text-caption text-ink-secondary">
              Expected for a persona that is still a hypothesis. The fallback path is
              recorded on the AgentRun, so which template was used stays auditable.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
