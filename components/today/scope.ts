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

export function inScope(scope: TodayScope, owner: string | null | undefined, userName?: string): boolean {
  if (scope === 'all') return true;
  return !owner || (!!userName && owner === userName);
}
