"use client";

import { useState } from "react";
import { LayoutTemplateIcon, PlusIcon } from "lucide-react";

import { TemplateEditorDialog } from "@/components/templates/TemplateEditorDialog";
import { TemplateViewer } from "@/components/templates/TemplateViewer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useTemplates } from "@/hooks/useTemplates";
import type { TemplateKind } from "@/types/template";

export function TemplateList({ kind }: { kind?: TemplateKind }) {
  const { data, isLoading } = useTemplates(kind);
  const [creating, setCreating] = useState(false);
  const rows = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <PlusIcon />
          New template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-5" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={LayoutTemplateIcon} title="No templates here yet" />
      ) : (
        <div className="space-y-4">
          {rows.map((t) => (
            <TemplateViewer key={t.id} template={t} />
          ))}
        </div>
      )}

      {creating && (
        <TemplateEditorDialog
          defaultKind={kind}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
