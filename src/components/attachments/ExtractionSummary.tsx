import { Badge } from "@/components/ui/badge";
import type { AttachmentExtraction } from "@/types/attachment";

/**
 * What the sandboxed extractor got out of the file.
 *
 * AN OPAQUE FORMAT IS NOT AN ERROR. A file that uploaded cleanly but has no
 * text handler is accepted, stored, and represented to the agent by metadata
 * only — the visitor is told that plainly, and the team must see the same
 * honest framing rather than a red "failed" that would prompt someone to chase
 * a non-problem (Surface 2 v5.0 §4.2, Playbook v1.6 §13.4).
 *
 * The distinction the operator actually needs:
 *   · no extraction record at all → the file never got that far (quarantined)
 *   · handler `opaque`            → accepted, metadata only, working as intended
 *   · `error` set                 → extraction genuinely failed
 */
export function ExtractionSummary({
  extraction,
}: {
  extraction: AttachmentExtraction | null;
}) {
  if (!extraction) {
    return (
      <span className="text-sec text-ink-secondary">
        Not extracted — the file did not clear scanning.
      </span>
    );
  }

  if (extraction.handler === "opaque") {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge variant="neutral">Metadata only</Badge>
        <span className="text-caption text-ink-secondary">
          Accepted — no text handler for this format. Not a failure.
        </span>
      </span>
    );
  }

  if (extraction.error) {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge variant="warning">Extraction failed</Badge>
        <span className="text-caption text-ink-secondary">{extraction.error}</span>
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-caption text-ink-secondary">
      <code className="rounded bg-soft px-1 py-0.5 font-mono text-micro">
        {extraction.handler}
      </code>
      {extraction.charCount !== null && (
        <span className="tabular-nums">{extraction.charCount.toLocaleString()} chars</span>
      )}
      {extraction.pageCount !== null && (
        <span className="tabular-nums">· {extraction.pageCount} pages</span>
      )}
      {extraction.truncated && <Badge variant="warning">Truncated</Badge>}
    </span>
  );
}
