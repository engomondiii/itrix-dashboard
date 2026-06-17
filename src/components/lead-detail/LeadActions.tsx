"use client";

import { useState } from "react";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  FileSignatureIcon,
  FlaskConicalIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLeadActions } from "@/hooks/useLeadActions";
import { useToast } from "@/hooks/useToast";
import type { Lead } from "@/types/lead";

export function LeadActions({ lead }: { lead: Lead }) {
  const { escalate, markNda } = useLeadActions(lead.id);
  const { toast } = useToast();
  const [confirmEscalate, setConfirmEscalate] = useState(false);

  return (
    <div className="space-y-2">
      <Button className="w-full justify-start" onClick={() => toast.info("Opens Calendly in Phase 10")}>
        <CalendarIcon />
        Book meeting
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        disabled={markNda.isPending}
        onClick={() => markNda.mutate()}
      >
        <FileSignatureIcon />
        Mark NDA required
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => toast.info("Creates a paid evaluation in Phase 8")}
      >
        <ClipboardCheckIcon />
        Request paid evaluation
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => toast.info("Creates a PoC record in Phase 8")}
      >
        <FlaskConicalIcon />
        Mark PoC candidate
      </Button>
      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={() => setConfirmEscalate(true)}
      >
        <TriangleAlertIcon />
        Escalate to executive review
      </Button>

      <ConfirmDialog
        open={confirmEscalate}
        onOpenChange={setConfirmEscalate}
        title="Escalate to executive review?"
        description="Exclusive / strategic requests are routed to Park Dae-hyuk and CEO Kang."
        confirmLabel="Escalate"
        destructive
        loading={escalate.isPending}
        onConfirm={() => {
          escalate.mutate();
          setConfirmEscalate(false);
        }}
      />
    </div>
  );
}
