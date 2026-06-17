"use client";

import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useToast } from "@/hooks/useToast";
import type { Lead } from "@/types/lead";

/** AI-drafted follow-up email (template from the Master Architecture §9.5). */
function draftFor(lead: Lead) {
  const subject = `Your ALPHA Compute / Core Assessment — ${lead.company ?? "your team"}`;
  const body = `Dear ${lead.visitorName ?? "there"},

Thank you for sharing your compute bottleneck with iTrix.

Based on your response, your organization appears to be facing a potential ${lead.primaryPain.toLowerCase()} constraint in ${lead.industry}. Our initial assessment suggests this may be relevant to ${lead.productRoute}.

The appropriate next step would be a confidential discussion to determine whether a paid ALPHA assessment is justified. Before any sensitive technical information is exchanged, we can proceed under NDA.

Best regards,
iTrix Assessment Team`;
  return { subject, body };
}

export function FollowUpEmailDraft({ lead }: { lead: Lead }) {
  const { toast } = useToast();
  const { subject, body } = draftFor(lead);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
          Subject
        </div>
        <CopyButton value={`${subject}\n\n${body}`} label="Copy" />
      </div>
      <div className="text-sec text-ink-800">{subject}</div>
      <pre className="max-h-56 overflow-y-auto rounded-md bg-surface-sunken p-3 font-sans text-sec whitespace-pre-wrap text-ink-700">
        {body}
      </pre>
      <Button
        size="sm"
        className="w-full"
        onClick={() => toast.success("Email queued (Resend wires up at cutover)")}
      >
        <SendIcon />
        Send follow-up
      </Button>
    </div>
  );
}
