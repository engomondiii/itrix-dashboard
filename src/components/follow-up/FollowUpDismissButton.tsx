"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useFollowUpActions } from "@/hooks/useFollowUp";

/** Drop a follow-up that no longer needs action (lead not interested, etc.). */
export function FollowUpDismissButton({ taskId }: { taskId: string }) {
  const { dismiss } = useFollowUpActions();
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setConfirm(true)}
        disabled={dismiss.isPending}
        aria-label="Dismiss follow-up"
      >
        <XIcon />
        Dismiss
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Dismiss this follow-up?"
        description="It will be removed from the queue without being marked as completed."
        confirmLabel="Dismiss"
        destructive
        loading={dismiss.isPending}
        onConfirm={() => {
          dismiss.mutate(taskId);
          setConfirm(false);
        }}
      />
    </>
  );
}
