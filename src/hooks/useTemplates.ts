"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  type TemplateInput,
} from "@/lib/api/templatesApi";
import { useToast } from "@/hooks/useToast";
import type { Template, TemplateKind } from "@/types/template";

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

/** Create / edit / delete templates; refresh the lists on success. */
export function useTemplateActions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["templates"] });
  const onError = (e: unknown) => toast.error((e as Error).message);

  return {
    create: useMutation({
      mutationFn: (input: TemplateInput) => createTemplate(input),
      onSuccess: () => {
        invalidate();
        toast.success("Template created");
      },
      onError,
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; patch: Partial<TemplateInput> }) =>
        updateTemplate(vars.id, vars.patch),
      onSuccess: (t: Template) => {
        invalidate();
        qc.setQueryData(["template", t.id], t);
        toast.success("Template saved");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteTemplate(id),
      onSuccess: () => {
        invalidate();
        toast.success("Template deleted");
      },
      onError,
    }),
  };
}
