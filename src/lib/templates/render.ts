import type { Lead } from "@/types/lead";

/**
 * Substitute {{variable}} placeholders in a template body. Unknown placeholders
 * are left intact so the sender can see (and fill) what's missing.
 */
export function renderTemplate(
  body: string,
  values: Record<string, string>,
): string {
  return body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, name) => {
    const key = String(name).trim();
    return key in values ? values[key] : match;
  });
}

/** The values a lead can fill into a template's placeholders. */
export function leadTemplateValues(lead: Lead): Record<string, string> {
  return {
    company: lead.company ?? "your team",
    name: lead.visitorName ?? "there",
    pain: lead.primaryPain.toLowerCase(),
    industry: lead.industry,
    route: lead.productRoute,
    tier: String(lead.tier),
    role: lead.role,
    timeline: lead.timeline,
    bottleneck: lead.computeBottleneck,
    nextStep: lead.recommendedNextStep,
  };
}

/** Split a body whose first line is "Subject: …" into subject + remaining body. */
export function splitSubject(text: string): { subject?: string; body: string } {
  const lines = text.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (/^subject:/i.test(first)) {
    return {
      subject: first.replace(/^subject:\s*/i, "").trim(),
      body: lines.slice(1).join("\n").trimStart(),
    };
  }
  return { body: text };
}
