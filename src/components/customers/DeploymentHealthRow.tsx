import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/formatting";
import type { DeploymentHealth } from "@/types/customer";

const STATUS_INTENT: Record<DeploymentHealth["status"], "success" | "warning" | "error"> = {
  healthy: "success",
  degraded: "warning",
  down: "error",
};

/**
 * One environment's operational status.
 *
 * KNOWN LIMITATIONS ARE SHOWN, NOT HIDDEN. "These are the limitations we
 * already know about. We would rather you hear them from us" (Playbook v1.6
 * §12C) is a customer-facing commitment, which means the internal view has to
 * carry the same list — an operator who cannot see what the customer has been
 * told will contradict it.
 */
export function DeploymentHealthRow({ deployment }: { deployment: DeploymentHealth }) {
  return (
    <li className="rounded-md border border-border-soft bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="text-sec font-medium text-ink-primary">
            {deployment.environment}
          </span>
          <code className="rounded bg-soft px-1 py-0.5 font-mono text-micro text-ink-secondary">
            {deployment.version}
          </code>
          <Badge variant={STATUS_INTENT[deployment.status]}>{deployment.status}</Badge>
        </span>
        <span className="text-micro text-ink-secondary">
          checked {formatTimeAgo(deployment.lastCheckedAt)}
        </span>
      </div>

      {deployment.knownLimitations.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {deployment.knownLimitations.map((limitation) => (
            <li key={limitation} className="text-caption text-ink-secondary">
              · {limitation}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
