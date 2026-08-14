/**
 * Time for a two-site team.
 *
 * itriX runs on Korean time: the visitors are there, the business day is
 * there, and every SLA is counted against it. The staff are not all there —
 * the console is worked from Seoul and from Nairobi, exactly six hours apart.
 *
 * That gap is invisible in the console today, in the worst way. Relative time
 * ("3 hours ago") hides it; absolute time is worse, because
 * `Intl.DateTimeFormat` with no `timeZone` silently renders in whatever zone
 * the browser is in. Two people reading the same row see two different clock
 * times, and neither one is labelled — so there is no way to tell, from the
 * screen, that they disagree.
 *
 * The rule here: there is ONE operating clock (KST) and it is named wherever
 * a time is shown. The viewer's own zone is offered alongside it when it
 * differs, never instead of it.
 */

export interface Site {
  key: string;
  city: string;
  /** IANA zone — the only thing that survives DST rule changes. */
  timeZone: string;
  /** Fixed label. `Intl` renders Asia/Seoul as "GMT+9", which nobody says. */
  label: string;
}

/** Staffed sites, operating site first. */
export const SITES: readonly Site[] = [
  { key: 'seoul', city: 'Seoul', timeZone: 'Asia/Seoul', label: 'KST' },
  { key: 'nairobi', city: 'Nairobi', timeZone: 'Africa/Nairobi', label: 'EAT' },
];

/** The company clock. Every SLA, business hour and "today" is this zone. */
export const OPERATING_SITE: Site = SITES[0];

/** The zone the browser is in. Never used alone — always next to KST. */
export function viewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || OPERATING_SITE.timeZone;
  } catch {
    return OPERATING_SITE.timeZone;
  }
}

/** The site whose zone the viewer is sitting in, if it's one of ours. */
export function viewerSite(): Site | null {
  const zone = viewerTimeZone();
  return SITES.find((site) => site.timeZone === zone) ?? null;
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Formatter construction dominates formatter cost, so cache by option shape —
// same reasoning as lib/entity/format.ts.
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let cached = formatters.get(key);
  if (!cached) {
    // en-GB gives "14 Aug", not "Aug 14" — day-first reads the same way in
    // both offices and avoids the US/rest-of-world ambiguity entirely.
    cached = new Intl.DateTimeFormat('en-GB', options);
    formatters.set(key, cached);
  }
  return cached;
}

/** 24-hour everywhere: "3:04 pm" in a handover note is an incident waiting. */
const CLOCK: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };

/** Wall-clock time in any IANA zone: "15:04". */
export function clockInZone(timeZone: string, at: Date = new Date()): string {
  return formatter({ ...CLOCK, timeZone }).format(at);
}

/** Wall-clock time at a site: "15:04". */
export function clockAt(site: Site, at: Date = new Date()): string {
  return clockInZone(site.timeZone, at);
}

/** Wall-clock time with its zone named: "15:04 KST". */
export function labelledClockAt(site: Site, at: Date = new Date()): string {
  return `${clockAt(site, at)} ${site.label}`;
}

export interface InstantOptions {
  /** Defaults to the operating site — pass a zone only to show a second one. */
  site?: Site;
  /** Drop the date and show time only. */
  timeOnly?: boolean;
  /** Include the year. Off by default; on for anything over ~10 months old. */
  withYear?: boolean;
}

/**
 * An absolute, zone-named instant: "14 Aug, 15:04 KST".
 *
 * This is the format for anything a second person has to act on — a handover
 * note, an SLA deadline, a scheduled meeting. Relative time is fine for
 * "how stale is this", useless for "when exactly".
 */
export function formatInstant(value: unknown, options: InstantOptions = {}): string {
  const date = parseDate(value);
  if (!date) return '';
  const { site = OPERATING_SITE, timeOnly = false, withYear = false } = options;

  const time = formatter({ ...CLOCK, timeZone: site.timeZone }).format(date);
  if (timeOnly) return `${time} ${site.label}`;

  const day = formatter({
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: site.timeZone,
  }).format(date);

  return `${day}, ${time} ${site.label}`;
}

/**
 * The full disclosure, for a tooltip: the operating clock first, then the
 * viewer's own if it differs.
 *
 *   "14 Aug, 15:04 KST · 09:04 your time (Africa/Nairobi)"
 */
export function describeInstant(value: unknown): string {
  const date = parseDate(value);
  if (!date) return '';

  // Over ~10 months, a bare "14 Aug" is genuinely ambiguous.
  const withYear = Math.abs(Date.now() - date.getTime()) > 300 * 86_400_000;
  const primary = formatInstant(date, { withYear });

  const zone = viewerTimeZone();
  if (zone === OPERATING_SITE.timeZone) return primary;

  const local = formatter({ ...CLOCK, timeZone: zone }).format(date);
  const site = viewerSite();
  return `${primary} · ${local} your time (${site ? site.city : zone})`;
}

/**
 * Whole-hour offset between a site and the operating clock: Nairobi is -6.
 *
 * Computed from the zones rather than stored, because "Seoul is six hours
 * ahead of Nairobi" is only true while neither observes DST. Neither does
 * today; hard-coding it would be a silent bug the day that changes.
 */
export function hoursFromOperating(site: Site, at: Date = new Date()): number {
  const read = (timeZone: string) => {
    const parts = formatter({
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at);
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  };
  return Math.round((read(site.timeZone) - read(OPERATING_SITE.timeZone)) / 3_600_000);
}
