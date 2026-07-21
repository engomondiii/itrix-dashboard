import { apiGet, apiSend, type QueryParams } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { AttachmentDetail, AttachmentListItem } from "@/types/attachment";

export async function getAttachmentQueue(
  params: QueryParams = {},
): Promise<AttachmentListItem[]> {
  const data = await apiGet<{ results: AttachmentListItem[] }>(
    API.cockpitAttachmentQueue,
    params,
  );
  return data.results;
}

export function getAttachment(attachmentId: string) {
  return apiGet<AttachmentDetail>(API.cockpitAttachment(attachmentId));
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
