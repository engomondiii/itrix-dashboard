import { Fragment } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import type { Template } from "@/types/template";

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
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-card-title font-semibold text-ink-900">{template.name}</span>
          <Badge variant="neutral">{template.kind}</Badge>
        </div>
        <CopyButton value={template.body} label="Copy" />
      </div>
      <pre className="mt-3 overflow-x-auto rounded-md bg-surface-sunken p-3 font-sans text-sec whitespace-pre-wrap text-ink-700">
        {renderBody(template.body)}
      </pre>
      <div className="mt-2 text-caption text-ink-400">
        {template.variables.length} variable{template.variables.length === 1 ? "" : "s"} ·
        updated {formatDate(template.updatedAt)}
      </div>
    </div>
  );
}
