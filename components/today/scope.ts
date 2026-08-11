/**
 * Multi-staff scope for the Today queue.
 *
 * With several people watching the same queue, the useful default is "what's
 * MINE plus what nobody has picked up" — a teammate's owned work is theirs.
 * 'all' shows everything for stand-up-style review.
 *
 * Ownership on the wire is a display NAME (not email/id) on follow-ups,
 * leads and support rows; unowned is null or "".
 */

export type TodayScope = 'mine' | 'all';

/** The "probably waiting" heuristic shared by the band and the summary strip. */
export function isProbablyWaiting(row: {
  visitorTurns: number;
  lastActivityAt: string | null;
  createdAt: string;
}): boolean {
  if (row.visitorTurns === 0) return false;
  const last = row.lastActivityAt ?? row.createdAt;
  return Date.now() - new Date(last).getTime() < 24 * 60 * 60 * 1000;
}

export function inScope(scope: TodayScope, owner: string | null | undefined, userName?: string): boolean {
  if (scope === 'all') return true;
  return !owner || (!!userName && owner === userName);
}
