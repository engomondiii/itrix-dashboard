/**
 * Human SLA countdown from a millisecond delta.
 * Positive → time remaining ("2h 14m"); non-positive → "Overdue 1h 3m".
 */
export function formatSLATime(ms: number): string {
  const overdue = ms <= 0;
  const abs = Math.abs(ms);
  const totalMin = Math.floor(abs / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;

  let body: string;
  if (days > 0) body = `${days}d ${hours}h`;
  else if (hours > 0) body = `${hours}h ${mins}m`;
  else body = `${mins}m`;

  return overdue ? `Overdue ${body}` : body;
}
