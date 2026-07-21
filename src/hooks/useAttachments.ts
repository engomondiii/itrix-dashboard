"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAttachment,
  getAttachmentQueue,
  setAttachmentStatus,
} from "@/lib/api/attachmentsApi";
import { useToast } from "@/hooks/useToast";
import type { QueryParams } from "@/lib/api/client";

export function useAttachmentQueue(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["attachment-queue", params],
    queryFn: () => getAttachmentQueue(params),
    // Scans and extractions complete in the background, so the queue moves on
    // its own even when nobody touches it.
    refetchInterval: 30_000,
  });
}

export function useAttachmentDetail(attachmentId: string) {
  return useQuery({
    queryKey: ["attachment", attachmentId],
    queryFn: () => getAttachment(attachmentId),
    enabled: Boolean(attachmentId),
  });
}

/**
 * Quarantine or release.
 *
 * Invalidates the thread caches as well as the attachment ones: a thread row
 * reports its worst scan outcome, so releasing a file changes what the board
 * says about the conversation that owns it.
 */
export function useAttachmentAction(attachmentId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (vars: { action: "quarantine" | "release"; reason: string }) =>
      setAttachmentStatus(attachmentId, vars.action, vars.reason),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["attachment", attachmentId] });
      qc.invalidateQueries({ queryKey: ["attachment-queue"] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      qc.invalidateQueries({ queryKey: ["thread"] });
      toast.success(
        vars.action === "release"
          ? "Released — the decision and its reason are in the audit trail."
          : "Quarantined.",
      );
    },
    onError: (e) => toast.error((e as Error).message),
  });
}
