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
import { BookMeetingDialog } from "@/components/lead-detail/BookMeetingDialog";
import { EscalateDialog } from "@/components/lead-detail/EscalateDialog";
import { RequestEvaluationDialog } from "@/components/lead-detail/RequestEvaluationDialog";
import { MarkPoCDialog } from "@/components/lead-detail/MarkPoCDialog";
import { useLeadActions } from "@/hooks/useLeadActions";
import type { Lead } from "@/types/lead";

export function LeadActions({ lead }: { lead: Lead }) {
  const { markNda } = useLeadActions(lead.id);
  const [escalating, setEscalating] = useState(false);
  const [bookingMeeting, setBookingMeeting] = useState(false);
  const [requestingEval, setRequestingEval] = useState(false);
  const [markingPoC, setMarkingPoC] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        className="w-full justify-start"
        onClick={() => setBookingMeeting(true)}
      >
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
        onClick={() => setRequestingEval(true)}
      >
        <ClipboardCheckIcon />
        Request paid evaluation
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setMarkingPoC(true)}
      >
        <FlaskConicalIcon />
        Mark PoC candidate
      </Button>
      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={() => setEscalating(true)}
      >
        <TriangleAlertIcon />
        Escalate to executive review
      </Button>

      {bookingMeeting && (
        <BookMeetingDialog lead={lead} onClose={() => setBookingMeeting(false)} />
      )}
      {requestingEval && (
        <RequestEvaluationDialog
          leadId={lead.id}
          onClose={() => setRequestingEval(false)}
        />
      )}
      {markingPoC && (
        <MarkPoCDialog leadId={lead.id} onClose={() => setMarkingPoC(false)} />
      )}
      {escalating && (
        <EscalateDialog leadId={lead.id} onClose={() => setEscalating(false)} />
      )}
    </div>
  );
}
