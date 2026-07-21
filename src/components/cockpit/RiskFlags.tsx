import { AlertTriangleIcon } from "lucide-react";

/**
 * Sensitivity alerts — reasons to slow down before answering.
 *
 * These are prompts for a human, not scores and not automation triggers. They
 * are team-plane only and must never be paraphrased into a message to the
 * visitor: "we flagged you as an acquisition risk" is not a sentence anyone
 * should be able to reconstruct from something we sent them.
 */
export function RiskFlags({ flags }: { flags?: string[] }) {
  if (!flags || flags.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {flags.map((flag) => (
        <li
          key={flag}
          className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft px-2.5 py-1.5"
        >
          <AlertTriangleIcon
            className="mt-0.5 size-3.5 shrink-0 text-warning-text"
            aria-hidden="true"
          />
          <span className="text-caption text-warning-text">{flag}</span>
        </li>
      ))}
    </ul>
  );
}
