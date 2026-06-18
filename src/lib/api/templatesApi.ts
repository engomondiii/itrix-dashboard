import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Template, TemplateKind } from "@/types/template";

export interface TemplateInput {
  kind: TemplateKind;
  name: string;
  body: string;
}

export function listTemplates(kind?: TemplateKind) {
  return apiGet<{ results: Template[]; count: number }>(
    API.templates,
    kind ? { kind } : undefined,
  );
}

export function getTemplate(id: string) {
  return apiGet<Template>(API.template(id));
}

export function createTemplate(input: TemplateInput) {
  return apiSend<Template>(API.templates, "POST", input);
}

export function updateTemplate(id: string, patch: Partial<TemplateInput>) {
  return apiSend<Template>(API.template(id), "PATCH", patch);
}

export function deleteTemplate(id: string) {
  return apiSend<{ ok: true }>(API.template(id), "DELETE");
}
