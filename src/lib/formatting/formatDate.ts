const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Jul 14, 2026" */
export function formatDate(iso: string | Date): string {
  return DATE_FMT.format(new Date(iso));
}

/** "Jul 14, 3:05 PM" */
export function formatDateTime(iso: string | Date): string {
  return DATETIME_FMT.format(new Date(iso));
}
