import { Badge } from "@/components/ui/badge";

/**
 * Hesitation, doubt or risk language detected in the conversation.
 *
 * These are SIGNALS, not a classification of the person. `objection_classification`
 * is on the client-plane deny-list precisely because a visitor told "we've
 * classified you as price-sensitive" would be right to walk away. Rendered as
 * warnings rather than errors: an objection is information, not a problem.
 */
export function ObjectionSignals({ signals }: { signals?: string[] }) {
  if (!signals || signals.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {signals.map((signal) => (
        <Badge key={signal} variant="warning">
          {signal}
        </Badge>
      ))}
    </div>
  );
}
