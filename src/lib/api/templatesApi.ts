import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Template, TemplateKind } from "@/types/template";

export function listTemplates(kind?: TemplateKind) {
  return apiGet<{ results: Template[]; count: number }>(
    API.templates,
    kind ? { kind } : undefined,
  );
}

export function getTemplate(id: string) {
  return apiGet<Template>(API.template(id));
}
