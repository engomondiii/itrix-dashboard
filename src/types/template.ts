export type TemplateKind = "email" | "follow-up" | "evaluation" | "poc" | "handoff";

export interface Template {
  id: string;
  kind: TemplateKind;
  name: string;
  /** Body with {{variable}} placeholders highlighted in the viewer. */
  body: string;
  variables: string[];
  updatedAt: string; // ISO
}
