import { Badge } from "@/components/ui/badge";
import { ARTIFACT_TYPE_LABEL, isArtifactType } from "@/constants/artifactTypes";
import { DISCLOSURE_CEILING_LABEL } from "@/constants/shellContract";
import { formatDateTime } from "@/lib/formatting";
import type { ThreadArtifact } from "@/types/thread";

const GOVERNANCE_INTENT: Record<
  ThreadArtifact["governanceStatus"],
  "success" | "warning" | "error"
> = {
  approved: "success",
  under_review: "warning",
  rejected: "error",
};

/**
 * One artifact delivered into the thread.
 *
 * An UNKNOWN type renders its raw key with an error badge rather than falling
 * back to a generic renderer. That mirrors the rule on Surface 1 — a generic
 * renderer would display a payload nobody designed a disclosure review for —
 * and here it also surfaces the drift itself, which is the thing worth knowing.
 */
export function ArtifactRow({ artifact }: { artifact: ThreadArtifact }) {
  const known = isArtifactType(artifact.type);

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-soft bg-surface px-3 py-2">
      <span className="flex flex-wrap items-center gap-2">
        {known ? (
          <span className="text-sec font-medium text-ink-primary">
            {ARTIFACT_TYPE_LABEL[artifact.type]}
          </span>
        ) : (
          <Badge variant="error" title="Unknown artifact type — vocabulary drift">
            {artifact.type}
          </Badge>
        )}
        <Badge variant="neutral">v{artifact.version}</Badge>
        <Badge variant="neutral">
          {DISCLOSURE_CEILING_LABEL[artifact.disclosureLevel]}
        </Badge>
        <Badge variant={GOVERNANCE_INTENT[artifact.governanceStatus]}>
          {artifact.governanceStatus.replace("_", " ")}
        </Badge>
        {artifact.supersededById && <Badge variant="warning">Superseded</Badge>}
      </span>
      <span className="text-micro text-ink-secondary">
        {formatDateTime(artifact.createdAt)}
      </span>
    </li>
  );
}
