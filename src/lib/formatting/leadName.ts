/**
 * How a lead is labelled in the UI.
 *
 * A lead created from an anonymous Surface 1 review has no company and no visitor
 * name — the backend returns empty strings, not nulls. `company ?? "—"` therefore
 * renders nothing, which left the Leads table with blank, unclickable rows. Always
 * resolve a lead's label through here.
 */

interface NameableLead {
  id: string;
  company?: string | null;
  visitorName?: string | null;
  email?: string | null;
}

/** First non-blank value, treating "" and whitespace as absent. */
function firstPresent(...values: (string | null | undefined)[]): string | undefined {
  return values.find((v) => typeof v === "string" && v.trim().length > 0)?.trim();
}

/** A short, stable stand-in for a lead with no identifying details yet. */
function anonymousLabel(id: string): string {
  return `Anonymous lead · ${id.slice(0, 8)}`;
}

/** The primary label for a lead — never empty, always safe to render as a link. */
export function leadDisplayName(lead: NameableLead): string {
  return (
    firstPresent(lead.company, lead.visitorName, lead.email) ?? anonymousLabel(lead.id)
  );
}

/**
 * The secondary line under the primary label (a person, or their role). Returns
 * undefined when there is nothing worth showing, so callers can omit the element.
 */
export function leadSubtitle(
  lead: NameableLead & { role?: string | null },
): string | undefined {
  // Don't echo the primary label back as its own subtitle.
  const primary = leadDisplayName(lead);
  const candidate = firstPresent(lead.visitorName, lead.role);
  return candidate && candidate !== primary ? candidate : undefined;
}

/** A label for salutations and templates, e.g. "Dear there," when unknown. */
export function leadSalutation(lead: NameableLead, fallback = "there"): string {
  return firstPresent(lead.visitorName) ?? fallback;
}

/** A label for the lead's organisation, e.g. "your team" when unknown. */
export function leadCompany(lead: NameableLead, fallback = "your team"): string {
  return firstPresent(lead.company) ?? fallback;
}
