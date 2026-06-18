"use client";

import { useState } from "react";
import { ChevronDownIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSendEmail } from "@/hooks/useEmail";
import { useTemplates } from "@/hooks/useTemplates";
import {
  leadTemplateValues,
  renderTemplate,
  splitSubject,
} from "@/lib/templates/render";
import type { Lead } from "@/types/lead";
import type { Template } from "@/types/template";

/** Default AI-drafted follow-up (Master Architecture §9.5), used until a template is applied. */
function defaultDraft(lead: Lead) {
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
  const sendEmail = useSendEmail();
  const templates = useTemplates("email");
  const initial = defaultDraft(lead);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);

  function applyTemplate(tpl: Template) {
    const rendered = renderTemplate(tpl.body, leadTemplateValues(lead));
    const split = splitSubject(rendered);
    if (split.subject) setSubject(split.subject);
    setBody(split.body);
  }

  const emailTemplates = templates.data?.results ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
          Subject
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" disabled={!emailTemplates.length} />
              }
            >
              Use template
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {emailTemplates.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => applyTemplate(t)}>
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CopyButton value={`${subject}\n\n${body}`} label="Copy" />
        </div>
      </div>
      <Input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        aria-label="Email subject"
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={9}
        aria-label="Email body"
        className="max-h-72"
      />
      <Button
        size="sm"
        className="w-full"
        disabled={sendEmail.isPending || !subject.trim() || !body.trim()}
        onClick={() =>
          sendEmail.mutate({ to: lead.email, subject, body, leadId: lead.id })
        }
      >
        <SendIcon />
        {sendEmail.isPending ? "Sending…" : "Send follow-up"}
      </Button>
    </div>
  );
}
