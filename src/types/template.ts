export const TEMPLATE_KINDS = [
  "email",
  "follow-up",
  "evaluation",
  "poc",
  "handoff",
] as const;
export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

export const TEMPLATE_KIND_LABELS: Record<TemplateKind, string> = {
  email: "Email",
  "follow-up": "Follow-up",
  evaluation: "Evaluation",
  poc: "PoC",
  handoff: "Handoff",
};

export interface Template {
  id: string;
  kind: TemplateKind;
  name: string;
  /** Body with {{variable}} placeholders highlighted in the viewer. */
  body: string;
  variables: string[];
  updatedAt: string; // ISO
}
