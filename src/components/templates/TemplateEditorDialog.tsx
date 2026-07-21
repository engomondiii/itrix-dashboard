"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTemplateActions } from "@/hooks/useTemplates";
import {
  TEMPLATE_KINDS,
  TEMPLATE_KIND_LABELS,
  type Template,
  type TemplateKind,
} from "@/types/template";

/**
 * Create (no `template`) or edit (with `template`) a message template.
 * Mount only when open; `onClose` unmounts it. Variables are derived from the
 * body server-side, so the operator only edits name / kind / body.
 */
export function TemplateEditorDialog({
  template,
  defaultKind,
  onClose,
}: {
  template?: Template;
  defaultKind?: TemplateKind;
  onClose: () => void;
}) {
  const { create, update } = useTemplateActions();
  const editing = !!template;

  const [name, setName] = useState(template?.name ?? "");
  const [kind, setKind] = useState<TemplateKind>(
    template?.kind ?? defaultKind ?? "email",
  );
  const [body, setBody] = useState(template?.body ?? "");

  const pending = create.isPending || update.isPending;
  const valid = name.trim().length > 0 && body.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    const payload = { kind, name: name.trim(), body };
    if (editing && template) {
      update.mutate({ id: template.id, patch: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="tpl-name">Name</Label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
                autoFocus
              />
            </div>
            <div className="w-40 space-y-1.5">
              <Label htmlFor="tpl-kind">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(String(v) as TemplateKind)}>
                <SelectTrigger id="tpl-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {TEMPLATE_KIND_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">Body</Label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Wrap variables in {{double braces}}…"
              className="min-h-56 font-mono text-sec"
            />
            <p className="text-caption text-ink-secondary">
              Variables are detected automatically from {"{{double braces}}"}.
            </p>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
