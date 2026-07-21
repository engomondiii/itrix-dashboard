import { Badge } from "@/components/ui/badge";
import type { RelationshipTeamMember } from "@/types/customer";

const ROLE_HANDLES: Record<RelationshipTeamMember["role"], string> = {
  "Customer success": "Day-to-day, outcomes, and anything that is not working.",
  Technical: "The workload, the deployment, and the numbers.",
  Executive: "Commercial questions and decisions above the working level.",
  Support: "Anything urgent.",
};

/**
 * The named humans who own this relationship.
 *
 * THIS IS AN ABSOLUTE, NOT A COURTESY. "A customer can always reach a named
 * human without first negotiating with an agent" (R30). On Surface 1 that reach
 * lives in the conversation header at every state and every breakpoint; here it
 * is the operator's view of the same guarantee — if a role is unfilled, the
 * guarantee is broken for that customer and it should be visible.
 */
export function RelationshipTeamPanel({ team }: { team: RelationshipTeamMember[] }) {
  if (team.length === 0) {
    return (
      <p className="text-sec text-warning-text">
        No relationship team assigned — this customer has no named human to reach.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {team.map((member) => (
        <li key={member.id} className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="text-sec font-medium text-ink-primary">{member.name}</span>
            <span className="block text-caption text-ink-secondary">
              {ROLE_HANDLES[member.role]}
            </span>
          </span>
          <Badge variant="neutral">{member.role}</Badge>
        </li>
      ))}
    </ul>
  );
}
