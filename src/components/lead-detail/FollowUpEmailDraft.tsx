"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

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
  const [cc, setCc] = useState("");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentDraft, setAttachmentDraft] = useState("");

  function applyTemplate(tpl: Template) {
    const rendered = renderTemplate(tpl.body, leadTemplateValues(lead));
    const split = splitSubject(rendered);
    if (split.subject) setSubject(split.subject);
    setBody(split.body);
  }

  function addAttachment() {
    const v = attachmentDraft.trim();
    if (!v) return;
    setAttachments((prev) => [...prev, v]);
    setAttachmentDraft("");
  }

  const emailTemplates = templates.data?.results ?? [];
  const scheduledAt = scheduleLater && date && time ? `${date}T${time}` : undefined;
  const scheduleIncomplete = scheduleLater && !(date && time);

  function send() {
    sendEmail.mutate({
      to: lead.email,
      subject,
      body,
      leadId: lead.id,
      cc: cc.trim() || undefined,
      scheduledAt,
      attachments: attachments.length ? attachments : undefined,
    });
  }

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

      <Input
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        placeholder="Cc (comma-separated)"
        aria-label="Cc"
      />

      {/* Attachments — links or file references */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Input
            value={attachmentDraft}
            onChange={(e) => setAttachmentDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAttachment();
              }
            }}
            placeholder="Attach a link or document"
            aria-label="Attachment"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAttachment}
            disabled={!attachmentDraft.trim()}
            aria-label="Add attachment"
          >
            <PlusIcon />
          </Button>
        </div>
        {attachments.length > 0 && (
          <ul className="space-y-1">
            {attachments.map((a, i) => (
              <li
                key={`${a}-${i}`}
                className="flex items-center gap-1.5 rounded-md bg-surface-sunken px-2 py-1 text-caption text-ink-700"
              >
                <PaperclipIcon className="size-3.5 shrink-0 text-ink-400" />
                <span className="truncate">{a}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                  className="ml-auto text-ink-400 hover:text-ink-700"
                  aria-label={`Remove ${a}`}
                >
                  <XIcon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Schedule for later */}
      <label className="flex items-center gap-2 text-sec text-ink-700">
        <input
          type="checkbox"
          checked={scheduleLater}
          onChange={(e) => setScheduleLater(e.target.checked)}
          className="size-3.5"
        />
        Schedule for later
      </label>
      {scheduleLater && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Send date"
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Send time"
          />
        </div>
      )}

      <Button
        size="sm"
        className="w-full"
        disabled={
          sendEmail.isPending || !subject.trim() || !body.trim() || scheduleIncomplete
        }
        onClick={send}
      >
        <SendIcon />
        {sendEmail.isPending
          ? "Sending…"
          : scheduledAt
            ? "Schedule send"
            : "Send follow-up"}
      </Button>
    </div>
  );
}
