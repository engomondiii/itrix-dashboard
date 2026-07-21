import "server-only";

import type {
  AttachmentAuditEntry,
  AttachmentDetail,
  AttachmentListItem,
  AttachmentStatus,
  ExtractionHandler,
  ScanVerdict,
} from "@/types/attachment";
import { listThreads } from "@/mocks/threadsDb";

/**
 * Mock attachment store, derived from the thread store so the two agree.
 *
 * A thread board that says "3 attachments, worst: malicious" and a queue that
 * shows two clean files would make both untrustworthy, so the counts and
 * verdicts here are generated from the same thread rows rather than invented
 * independently.
 *
 * The population deliberately includes the awkward cases, because they are the
 * ones the queue exists for:
 *   · a QUARANTINED file (malicious scan) — never previewable, never
 *     downloadable without a logged release;
 *   · an OPAQUE binary that uploaded fine but could not be text-extracted —
 *     accepted, metadata only, and explicitly NOT an error;
 *   · PRE-NDA files with a visible retention expiry.
 */

const NOW = Date.parse("2026-07-21T11:00:00Z");

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}

interface FileSpec {
  filename: string;
  mime: string;
  handler: ExtractionHandler;
  bytes: number;
}

const FILE_SPECS: readonly FileSpec[] = [
  { filename: "inference-cost-breakdown.xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", handler: "xlsx", bytes: 184_320 },
  { filename: "cluster-topology.pdf", mime: "application/pdf", handler: "pdf", bytes: 2_310_144 },
  { filename: "solver-profile.log", mime: "text/plain", handler: "text", bytes: 51_200 },
  { filename: "kernel_dispatch.cu", mime: "text/x-c", handler: "code", bytes: 22_016 },
  { filename: "roadmap-q3.pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", handler: "pptx", bytes: 4_100_096 },
  { filename: "benchmark-run.json", mime: "application/json", handler: "json_xml", bytes: 8_704 },
  { filename: "rack-layout.png", mime: "image/png", handler: "image_ocr", bytes: 1_048_576 },
  { filename: "legacy-sim.dat", mime: "application/octet-stream", handler: "opaque", bytes: 15_728_640 },
  { filename: "nda-draft.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", handler: "docx", bytes: 66_560 },
];

const PRE_NDA_RETENTION_DAYS = 30;

/**
 * Risk flags are DERIVED and TEAM-ONLY. They describe handling requirements,
 * not a judgement about the visitor — an operator acts on them, nobody quotes
 * them back to anyone.
 */
function riskFlagsFor(spec: FileSpec, verdict: ScanVerdict, preNda: boolean): string[] {
  const flags: string[] = [];
  if (verdict === "malicious") flags.push("Malware signature matched — quarantined");
  if (verdict === "suspicious") flags.push("Heuristic match — review before release");
  if (spec.handler === "opaque") flags.push("Opaque binary — represented by metadata only");
  if (preNda) flags.push("Pre-NDA upload — restricted handling and shortened retention");
  if (spec.bytes > 4_000_000) flags.push("Large file — extraction ran near the CPU ceiling");
  if (spec.filename.includes("nda")) flags.push("Filename suggests contractual content");
  return flags;
}

function statusFor(verdict: ScanVerdict): AttachmentStatus {
  if (verdict === "malicious") return "quarantined";
  if (verdict === "error") return "failed";
  if (verdict === "pending") return "scanning";
  return "ready";
}

function buildAll(): AttachmentDetail[] {
  const out: AttachmentDetail[] = [];

  for (const thread of listThreads()) {
    if (thread.attachments.count === 0) continue;

    const seed = Math.abs(hash(thread.id));
    const preNda = (thread.journeyNumber ?? 1) < 6;

    for (let i = 0; i < thread.attachments.count; i += 1) {
      const spec = FILE_SPECS[(seed + i) % FILE_SPECS.length];
      // The thread's worst verdict belongs to exactly one of its files.
      const isWorst = i === 0 && thread.attachments.worstScan !== null;
      const verdict: ScanVerdict = isWorst ? thread.attachments.worstScan! : "clean";
      const status = statusFor(verdict);
      const id = `att_${thread.id}_${i + 1}`;
      const createdAt = new Date(NOW - (i + 1) * 37 * 60_000).toISOString();

      const extraction =
        status === "quarantined" || status === "failed"
          ? null
          : {
              handler: spec.handler,
              // An opaque file has NO extracted text. That is a valid outcome,
              // not a failure — `error` stays null on purpose.
              charCount: spec.handler === "opaque" ? null : Math.round(spec.bytes / 12),
              pageCount: spec.handler === "pdf" ? 14 : null,
              truncated: spec.bytes > 4_000_000,
              error: null,
              durationMs: 400 + (seed % 900),
            };

      const audit: AttachmentAuditEntry[] = [
        {
          id: `${id}-a1`,
          action: "upload",
          actor: thread.identityState === "anonymous" ? "anonymous session" : "client",
          plane: thread.identityState === "anonymous" ? "anonymous" : "client",
          purpose: null,
          at: createdAt,
        },
        {
          id: `${id}-a2`,
          action: "scan",
          actor: "clamav",
          plane: "team",
          purpose: `verdict: ${verdict}`,
          at: new Date(Date.parse(createdAt) + 4_000).toISOString(),
        },
      ];
      if (extraction) {
        audit.push({
          id: `${id}-a3`,
          action: "extract",
          actor: "extraction-worker",
          plane: "team",
          purpose:
            spec.handler === "opaque"
              ? "metadata only — no text handler for this format"
              : `${spec.handler} handler`,
          at: new Date(Date.parse(createdAt) + 9_000).toISOString(),
        });
      }
      if (status === "quarantined") {
        audit.push({
          id: `${id}-a4`,
          action: "quarantine",
          actor: "system",
          plane: "team",
          purpose: "malware signature matched",
          at: new Date(Date.parse(createdAt) + 6_000).toISOString(),
        });
      }

      out.push({
        id,
        filename: spec.filename,
        detectedMime: spec.mime,
        bytes: spec.bytes,
        status,
        scan: {
          engine: "clamav",
          verdict,
          detail: verdict === "malicious" ? "Eicar-Test-Signature" : null,
          scannedAt: new Date(Date.parse(createdAt) + 4_000).toISOString(),
        },
        extraction,
        threadId: thread.id,
        threadTitle: thread.title,
        identityState: thread.identityState,
        preNda,
        retentionExpiresAt: preNda
          ? new Date(Date.parse(createdAt) + PRE_NDA_RETENTION_DAYS * 86_400_000).toISOString()
          : null,
        riskFlags: riskFlagsFor(spec, verdict, preNda),
        createdAt,
        sha256: `${Math.abs(hash(id)).toString(16).padStart(8, "0")}${"0".repeat(56)}`.slice(0, 64),
        audit,
      });
    }
  }

  return out;
}

let CACHE: AttachmentDetail[] | null = null;

/** In-session overrides from quarantine / release, mirroring the other *Db stores. */
const statusOverrides = new Map<string, AttachmentStatus>();

function all(): AttachmentDetail[] {
  if (!CACHE) CACHE = buildAll();
  return CACHE.map((a) => {
    const override = statusOverrides.get(a.id);
    return override ? { ...a, status: override } : a;
  });
}

export interface AttachmentQueueQuery {
  scan?: string;
  preNdaOnly?: boolean;
  quarantinedOnly?: boolean;
}

export function listAttachments(q: AttachmentQueueQuery = {}): AttachmentListItem[] {
  let rows = all();
  if (q.scan && q.scan !== "all") rows = rows.filter((a) => a.scan.verdict === q.scan);
  if (q.preNdaOnly) rows = rows.filter((a) => a.preNda);
  if (q.quarantinedOnly) rows = rows.filter((a) => a.status === "quarantined");

  // Anything needing a decision first: quarantined, then suspicious, then the rest.
  const urgency = (a: AttachmentListItem) =>
    a.status === "quarantined" ? 2 : a.scan.verdict === "suspicious" ? 1 : 0;

  return [...rows]
    .sort((a, b) => urgency(b) - urgency(a) || Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(({ ...rest }) => rest);
}

export function getAttachment(attachmentId: string): AttachmentDetail | null {
  return all().find((a) => a.id === attachmentId) ?? null;
}

export type AttachmentActionOutcome =
  | { ok: true; attachment: AttachmentDetail }
  | { ok: false; status: 404 | 409; detail: string };

/**
 * Quarantine or release, with the audit entry the action requires.
 *
 * Release demands a reason and is always logged — Surface 2 v5.0 §4.2: "Release
 * is a deliberate, logged action with a reason." There is deliberately no way
 * to release without one.
 */
export function setAttachmentStatus(
  attachmentId: string,
  action: "quarantine" | "release",
  actor: string,
  reason: string,
): AttachmentActionOutcome {
  const attachment = getAttachment(attachmentId);
  if (!attachment) return { ok: false, status: 404, detail: "Not found" };

  if (action === "release" && !reason.trim()) {
    return { ok: false, status: 409, detail: "A release requires a reason." };
  }
  if (action === "release" && attachment.status !== "quarantined") {
    return { ok: false, status: 409, detail: "Only a quarantined file can be released." };
  }

  const next: AttachmentStatus = action === "quarantine" ? "quarantined" : "ready";
  statusOverrides.set(attachmentId, next);

  const entry: AttachmentAuditEntry = {
    id: `${attachmentId}-a${attachment.audit.length + 1}`,
    action,
    actor,
    plane: "team",
    purpose: reason.trim() || null,
    at: new Date().toISOString(),
  };
  attachment.audit.push(entry);

  return { ok: true, attachment: { ...attachment, status: next } };
}

/** Queue depth for the topbar chip and the overview widget. */
export function countAttachmentsNeedingReview(): number {
  return all().filter(
    (a) => a.status === "quarantined" || a.scan.verdict === "suspicious",
  ).length;
}
