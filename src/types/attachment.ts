/**
 * Visitor attachments as the review queue sees them (Backend v6.0 §4).
 *
 * Accepting arbitrary files from unidentified visitors on a pre-NDA surface is
 * the largest new risk in v2.6, and this surface is where a human inspects the
 * result. Four boundaries hold underneath everything here, and nothing on this
 * surface may appear to soften them:
 *
 *   1. An attachment NEVER raises a disclosure ceiling. The ceiling derives from
 *      the identity plane and NDA/contract state only.
 *   2. An attachment is NEVER ingested into the Knowledge Core — not embedded,
 *      not indexed, not cross-served, not used for training or evaluation.
 *   3. An attachment is scoped to its owning thread.
 *   4. A visitor can delete any attachment at any time, and the purge is
 *      verifiable.
 *
 * `riskFlags` is a DERIVED, TEAM-PLANE-ONLY field. It never appears on the
 * anonymous or client plane and never leaves this repo.
 */

/** Lifecycle. Scan strictly precedes extraction — an extraction on an unscanned blob is a defect. */
export const ATTACHMENT_STATUSES = [
  "staged",
  "scanning",
  "scanned",
  "extracting",
  "ready",
  "quarantined",
  "failed",
  "purged",
] as const;
export type AttachmentStatus = (typeof ATTACHMENT_STATUSES)[number];

export const ATTACHMENT_STATUS_LABEL: Record<AttachmentStatus, string> = {
  staged: "Staged",
  scanning: "Scanning",
  scanned: "Scanned",
  extracting: "Extracting",
  ready: "Ready",
  quarantined: "Quarantined",
  failed: "Failed",
  purged: "Purged",
};

export const SCAN_VERDICTS = ["clean", "suspicious", "malicious", "error", "pending"] as const;
export type ScanVerdict = (typeof SCAN_VERDICTS)[number];

export const SCAN_VERDICT_LABEL: Record<ScanVerdict, string> = {
  clean: "Clean",
  suspicious: "Suspicious",
  malicious: "Malicious",
  error: "Scan error",
  pending: "Pending",
};

export const SCAN_VERDICT_INTENT: Record<
  ScanVerdict,
  "success" | "warning" | "error" | "neutral"
> = {
  clean: "success",
  suspicious: "warning",
  malicious: "error",
  error: "warning",
  pending: "neutral",
};

/** Ordering for "the worst outcome on this thread". */
const VERDICT_SEVERITY: Record<ScanVerdict, number> = {
  malicious: 4,
  suspicious: 3,
  error: 2,
  pending: 1,
  clean: 0,
};

export function worstVerdict(verdicts: readonly ScanVerdict[]): ScanVerdict | null {
  if (verdicts.length === 0) return null;
  return verdicts.reduce((worst, v) =>
    VERDICT_SEVERITY[v] > VERDICT_SEVERITY[worst] ? v : worst,
  );
}

/** The per-format extraction handlers (Backend v6.0 §1.2 `services/handlers/`). */
export type ExtractionHandler =
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "csv_tsv"
  | "text"
  | "code"
  | "json_xml"
  | "image_ocr"
  | "opaque";

/**
 * The extraction result.
 *
 * `opaque` IS NOT A FAILURE. A file that uploads but cannot be text-extracted is
 * accepted and represented by metadata only; the visitor is told so plainly and
 * the team sees the same honest framing (Playbook v1.6 §13.4). Rendering it as
 * an error would be a copy bug with a governance edge — we would be telling
 * someone what they gave us was worthless.
 */
export interface AttachmentExtraction {
  handler: ExtractionHandler;
  charCount: number | null;
  pageCount: number | null;
  truncated: boolean;
  error: string | null;
  durationMs: number | null;
}

export interface AttachmentScan {
  engine: string;
  verdict: ScanVerdict;
  detail: string | null;
  scannedAt: string | null; // ISO
}

export interface AttachmentListItem {
  id: string;
  filename: string;
  detectedMime: string;
  bytes: number;
  status: AttachmentStatus;
  scan: AttachmentScan;
  extraction: AttachmentExtraction | null;
  threadId: string;
  threadTitle: string;
  /** The identity plane of the thread that owns it. */
  identityState: "anonymous" | "identified" | "authenticated_customer";
  /** Restricted handling: shorter retention, encryption at rest, thread-scoped access. */
  preNda: boolean;
  retentionExpiresAt: string | null; // ISO
  /** TEAM PLANE ONLY. Never included in any payload this surface sends onward. */
  riskFlags: string[];
  createdAt: string; // ISO
}

/** One audited action against an attachment. */
export interface AttachmentAuditEntry {
  id: string;
  action: "upload" | "scan" | "extract" | "agent_read" | "download" | "quarantine" | "release" | "purge";
  actor: string;
  plane: "anonymous" | "client" | "team";
  purpose: string | null;
  at: string; // ISO
}

export interface AttachmentDetail extends AttachmentListItem {
  sha256: string;
  audit: AttachmentAuditEntry[];
}
