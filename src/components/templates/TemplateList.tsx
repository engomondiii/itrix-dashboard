"use client";

import { LayoutTemplateIcon } from "lucide-react";

import { TemplateViewer } from "@/components/templates/TemplateViewer";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useTemplates } from "@/hooks/useTemplates";
import type { TemplateKind } from "@/types/template";

export function TemplateList({ kind }: { kind?: TemplateKind }) {
  const { data, isLoading } = useTemplates(kind);
  const rows = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (rows.length === 0) {
    return <EmptyState icon={LayoutTemplateIcon} title="No templates here yet" />;
  }
  return (
    <div className="space-y-4">
      {rows.map((t) => (
        <TemplateViewer key={t.id} template={t} />
      ))}
    </div>
  );
}
