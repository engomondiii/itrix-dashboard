import { Badge } from "@/components/ui/badge";
import type { PersonaMatch } from "@/types/persona";

const PATH_LABEL: Record<PersonaMatch["matchPath"], string> = {
  exact: "Exact persona match",
  family: "Functional-family match",
  generic: "Generic template",
};

const PATH_INTENT: Record<PersonaMatch["matchPath"], "success" | "info" | "neutral"> = {
  exact: "success",
  family: "info",
  generic: "neutral",
};

/**
 * How the matcher arrived at this persona, and how sure it is.
 *
 * The path is shown rather than just the persona because "exact match, 82%" and
 * "family fallback, 54%" warrant completely different behaviour from a
 * concierge — and both render as the same persona name otherwise.
 */
export function PersonaMatchBadge({ match }: { match: PersonaMatch }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={PATH_INTENT[match.matchPath]}>{PATH_LABEL[match.matchPath]}</Badge>
      <span className="tabular-nums text-micro text-ink-secondary">
        {match.confidence}% confidence
      </span>
    </span>
  );
}
