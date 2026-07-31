import { apiGet, apiSend, type QueryParams } from "@/lib/api/client";
import { API } from "@/constants/routes";
import {
  SCAN_VERDICTS,
  type AttachmentAuditEntry,
  type AttachmentDetail,
  type AttachmentListItem,
  type AttachmentScan,
  type ScanVerdict,
} from "@/types/attachment";

/**
 * BOUNDARY NORMALISATION (the tree binds — BACKEND_GAPS §4). The shipped v7.1
 * queue row (`apps/cockpit/services/attachment_review.py`) is flat —
 * `attachmentId, scanVerdict, scanDetail, scannedAt, declaredMime,
 * detectedMime…` — while this surface was built against the nested v6.0 shape
 * with a `scan` object. Both are accepted here; missing facts stay absent and
 * render as a dash rather than being invented.
 */

function normalizeVerdict(value: unknown): ScanVerdict {
  // "" on the wire means "no scan recorded yet" — which is what pending says.
  if (value == null || value === "") return "pending";
  return (SCAN_VERDICTS as readonly string[]).includes(String(value))
    ? (value as ScanVerdict)
    : "error";
}

type WireAttachmentRow = Partial<AttachmentListItem> & {
  attachmentId?: string;
  scanVerdict?: string;
  scanDetail?: string;
  scannedAt?: string | null;
};

function normalizeAttachmentRow(raw: WireAttachmentRow): AttachmentListItem {
  const scan: AttachmentScan = raw.scan ?? {
    engine: "",
    verdict: normalizeVerdict(raw.scanVerdict),
    detail: raw.scanDetail || null,
    scannedAt: raw.scannedAt ?? null,
  };

  return {
    ...raw,
    id: String(raw.id ?? raw.attachmentId ?? ""),
    filename: raw.filename ?? "",
    detectedMime: raw.detectedMime || raw.declaredMime || "",
    bytes: raw.bytes ?? 0,
    status: raw.status ?? "staged",
    scan,
    extraction: raw.extraction ?? null,
    threadId: raw.threadId ?? null,
    preNda: raw.preNda ?? false,
    retentionExpiresAt: raw.retentionExpiresAt ?? null,
    riskFlags: Array.isArray(raw.riskFlags) ? raw.riskFlags : [],
    createdAt: raw.createdAt ?? "",
  };
}

type WireAuditEntry = Partial<AttachmentAuditEntry> & {
  subject?: string;
  detail?: string;
};

type WireAttachmentDetail = WireAttachmentRow & {
  sha256?: string;
  audit?: WireAuditEntry[];
  scans?: AttachmentScan[];
};

function normalizeAttachmentDetail(raw: WireAttachmentDetail): AttachmentDetail {
  const row = normalizeAttachmentRow(raw);
  const scans = Array.isArray(raw.scans) ? raw.scans : undefined;
  return {
    ...row,
    // The v7.1 detail serves the scan history as `scans`, newest first; the
    // row-level `scan` object is its head when the flat fields were absent.
    scan: raw.scan ?? (scans?.[0] ? { ...scans[0], verdict: normalizeVerdict(scans[0].verdict) } : row.scan),
    scans,
    sha256: raw.sha256,
    audit: (raw.audit ?? []).map((entry, index) => ({
      id: String(entry.id ?? index),
      action: entry.action ?? "scan",
      // v7.1 writes the acting identity as `subject`.
      actor: entry.actor ?? entry.subject ?? "",
      plane: entry.plane ?? "team",
      purpose: entry.purpose ?? entry.detail ?? null,
      at: entry.at ?? "",
    })),
  };
}

export async function getAttachmentQueue(
  params: QueryParams = {},
): Promise<AttachmentListItem[]> {
  const data = await apiGet<{ results: WireAttachmentRow[] }>(
    API.cockpitAttachmentQueue,
    params,
  );
  return (data.results ?? []).map(normalizeAttachmentRow);
}

export async function getAttachment(attachmentId: string): Promise<AttachmentDetail> {
  const raw = await apiGet<WireAttachmentDetail>(API.cockpitAttachment(attachmentId));
  return normalizeAttachmentDetail(raw);
}

/**
 * Quarantine or release. `reason` is required for a release and is written to
 * the audit trail — the API rejects an empty one, so it is not optional here
 * either.
 */
export function setAttachmentStatus(
  attachmentId: string,
  action: "quarantine" | "release",
  reason: string,
) {
  return apiSend<AttachmentDetail>(
    API.cockpitAttachmentAction(attachmentId, action),
    "POST",
    { reason },
  );
}
