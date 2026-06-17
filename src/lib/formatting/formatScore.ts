import { SCORE_MAX } from "@/constants/scoring";

/** "84" — clamped integer score. */
export function formatScore(score: number): string {
  const n = Math.max(0, Math.min(SCORE_MAX, Math.round(score)));
  return String(n);
}

/** "84 / 100" */
export function formatScoreOutOf(score: number): string {
  return `${formatScore(score)} / ${SCORE_MAX}`;
}
