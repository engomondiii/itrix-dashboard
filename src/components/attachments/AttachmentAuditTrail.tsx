import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatting";
import type { AttachmentAuditEntry } from "@/types/attachment";

const ACTION_LABEL: Record<AttachmentAuditEntry["action"], string> = {
  upload: "Uploaded",
  scan: "Scanned",
  extract: "Extracted",
  agent_read: "Read by an agent",
  download: "Downloaded",
  quarantine: "Quarantined",
  release: "Released",
  purge: "Purged",
};

const ACTION_INTENT: Record<
  AttachmentAuditEntry["action"],
  "neutral" | "info" | "warning" | "error" | "success"
> = {
  upload: "neutral",
  scan: "info",
  extract: "info",
  agent_read: "info",
  download: "warning",
  quarantine: "error",
  release: "success",
  purge: "neutral",
};

/**
 * Every upload, scan, extraction, agent read, download and decision.
 *
 * Backend v6.0 §4 rule 9: every one of those is written to the audit log with
 * the subject, the plane and the purpose. Downloads are included and are
 * highlighted — a human reading a visitor's file is a privileged act, and the
 * UI says so before the download starts as well as after.
 */
export function AttachmentAuditTrail({ entries }: { entries: AttachmentAuditEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sec text-ink-secondary">No audit entries.</p>;
  }

  return (
    <ol className="space-y-2">
      {[...entries]
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
        .map((entry) => (
          <li key={entry.id} className="border-l border-border-soft pl-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="flex items-center gap-2">
                <Badge variant={ACTION_INTENT[entry.action]}>
                  {ACTION_LABEL[entry.action]}
                </Badge>
                <span className="text-sec text-ink-primary">{entry.actor}</span>
                <span className="font-mono text-micro text-ink-secondary">
                  {entry.plane} plane
                </span>
              </span>
              <span className="text-micro text-ink-secondary">
                {formatDateTime(entry.at)}
              </span>
            </div>
            {entry.purpose && (
              <p className="text-caption text-ink-secondary">{entry.purpose}</p>
            )}
          </li>
        ))}
    </ol>
  );
}
