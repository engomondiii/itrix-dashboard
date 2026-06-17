"use client";

import { useQuery } from "@tanstack/react-query";

import { getTemplate, listTemplates } from "@/lib/api/templatesApi";
import type { TemplateKind } from "@/types/template";

export function useTemplates(kind?: TemplateKind) {
  return useQuery({
    queryKey: ["templates", kind ?? "all"],
    queryFn: () => listTemplates(kind),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplate(id),
    enabled: Boolean(id),
  });
}
