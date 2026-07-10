"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useApprovalActions } from "@/hooks/useApprovals";
import { canAdminGovernance } from "@/constants/permissions";
import { AGENT_LABEL } from "@/constants/agentKeys";
import { ROUTES } from "@/constants/routes";
import type { ApprovalRequest, ApprovalStatus } from "@/types/agent";

import { ClaimLevelBadge } from "./ClaimLevelBadge";

const STATUS_INTENT: Record<ApprovalStatus, "warning" | "success" | "error" | "neutral"> = {
  pending: "warning",
  awaiting_second: "warning",
  approved: "success",
  edited: "success",
  rejected: "error",
  blocked: "error",
};
const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  awaiting_second: "Awaiting 2nd approver",
  approved: "Approved",
  edited: "Approved with edits",
  rejected: "Rejected",
  blocked: "Blocked",
};

/** One draft in the approval queue, with governed approve / edit / reject. */
export function DraftCard({ request }: { request: ApprovalRequest }) {
  const { user } = useAuth();
  const actions = useApprovalActions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(request.finalBody || request.draftBody);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const canAct = canAdminGovernance(user?.role);
  const busy =
    actions.approve.isPending || actions.edit.isPending || actions.reject.isPending;
  const awaiting = request.status === "awaiting_second";
  // A two-approver draft isn't delivered by the first approval — don't claim it is.
  const approveLabel = awaiting
    ? "Second approve & deliver"
    : request.requiresSecondApprover
      ? "Approve (1 of 2)"
      : "Approve & deliver";

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{AGENT_LABEL[request.agentKey]}</Badge>
        <ClaimLevelBadge level={request.claimLevel} />
        <Badge variant={STATUS_INTENT[request.status] ?? "neutral"}>
          {STATUS_LABEL[request.status] ?? request.status}
        </Badge>
        {request.requiresSecondApprover && <Badge variant="warning">2 approvers</Badge>}
        <div className="ml-auto flex items-center gap-3">
          {request.conversationId && (
            <Link
              href={ROUTES.consoleThread(request.conversationId)}
              className="text-micro text-sapphire-600 hover:underline"
            >
              Open thread
            </Link>
          )}
          {request.leadId && (
            <Link
              href={ROUTES.lead(request.leadId)}
              className="text-micro text-sapphire-600 hover:underline"
            >
              View lead
            </Link>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-line bg-surface p-3 text-sec text-ink-800 outline-none focus:border-sapphire-500"
        />
      ) : (
        <p className="text-sec whitespace-pre-wrap text-ink-800">
          {request.finalBody || request.draftBody}
        </p>
      )}

      {request.citedChunkIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {request.citedChunkIds.map((c) => (
            <Badge key={c} variant="info" className="font-mono">
              {c}
            </Badge>
          ))}
        </div>
      )}

      {awaiting && (
        <p className="text-caption text-ink-500">
          First approved by {request.firstApprover ?? "—"} — needs a different second
          approver.
        </p>
      )}

      {canAct ? (
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  actions.edit.mutate(
                    { id: request.id, body: draft },
                    { onSuccess: () => setEditing(false) },
                  )
                }
              >
                Save edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => actions.approve.mutate({ id: request.id })}
              >
                {approveLabel}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => setRejecting(true)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ) : (
        <p className="text-caption text-ink-400">
          Approval actions require Admin / Assessment Team.
        </p>
      )}

      {rejecting && canAct && (
        <div className="space-y-2 rounded-md border border-line bg-surface-sunken p-3">
          <label htmlFor={`reason-${request.id}`} className="text-micro text-ink-500">
            Why is this draft rejected? (recorded in the governance audit)
          </label>
          <input
            id={`reason-${request.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. unapproved benchmark figure"
            className="w-full rounded-md border border-line bg-surface p-2 text-sec text-ink-800 outline-none focus:border-sapphire-500"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={busy || !reason.trim()}
              onClick={() =>
                actions.reject.mutate(
                  { id: request.id, reason },
                  { onSuccess: () => setRejecting(false) },
                )
              }
            >
              Confirm reject
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
