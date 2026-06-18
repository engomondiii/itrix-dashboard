"use client";

import { Fragment, useState } from "react";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { TemplateEditorDialog } from "@/components/templates/TemplateEditorDialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/formatting";
import { useTemplateActions } from "@/hooks/useTemplates";
import { TEMPLATE_KIND_LABELS, type Template } from "@/types/template";

/** Splits a template body, highlighting {{variable}} placeholders. */
function renderBody(body: string) {
  const parts = body.split(/(\{\{[^}]+\}\})/g);
  return parts.map((p, i) =>
    /^\{\{[^}]+\}\}$/.test(p) ? (
      <span key={i} className="rounded bg-gold-100 px-1 font-medium text-gold-600">
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

export function TemplateViewer({ template }: { template: Template }) {
  const { remove } = useTemplateActions();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-card-title font-semibold text-ink-900">
            {template.name}
          </span>
          <Badge variant="neutral">{TEMPLATE_KIND_LABELS[template.kind]}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton value={template.body} label="Copy" />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Template actions"
              className="inline-flex size-7 items-center justify-center rounded-md text-ink-400 outline-none hover:bg-muted hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreVerticalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirming(true)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-md bg-surface-sunken p-3 font-sans text-sec whitespace-pre-wrap text-ink-700">
        {renderBody(template.body)}
      </pre>
      <div className="mt-2 text-caption text-ink-400">
        {template.variables.length} variable
        {template.variables.length === 1 ? "" : "s"} · updated{" "}
        {formatDate(template.updatedAt)}
      </div>

      {editing && (
        <TemplateEditorDialog
          template={template}
          onClose={() => setEditing(false)}
        />
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete template?"
        description={`“${template.name}” will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(template.id, { onSuccess: () => setConfirming(false) })
        }
      />
    </div>
  );
}
