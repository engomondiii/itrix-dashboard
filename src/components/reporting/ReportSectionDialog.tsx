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
import { Textarea } from "@/components/ui/textarea";
import { useReportActions } from "@/hooks/useReporting";
import type { ReportSection } from "@/types/report";

/** Add (no `section`) or edit (with `section`) a report section. */
export function ReportSectionDialog({
  reportId,
  section,
  onClose,
}: {
  reportId: string;
  section?: ReportSection;
  onClose: () => void;
}) {
  const { addSection, updateSection } = useReportActions();
  const editing = !!section;

  const [title, setTitle] = useState(section?.title ?? "");
  const [body, setBody] = useState(section?.body ?? "");

  const pending = addSection.isPending || updateSection.isPending;
  const valid = title.trim().length > 0 && body.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    if (editing && section) {
      updateSection.mutate(
        { reportId, sectionId: section.id, patch: { title: title.trim(), body } },
        { onSuccess: onClose },
      );
    } else {
      addSection.mutate(
        { reportId, input: { title: title.trim(), body } },
        { onSuccess: onClose },
      );
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
            <DialogTitle>{editing ? "Edit section" : "Add section"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="section-body">Body</Label>
            <Textarea
              id="section-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Narrative for this section…"
              className="min-h-40"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Add section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
