/**
 * The one bar shape the cockpit uses.
 *
 * Shared so readiness and license-out probability cannot drift apart visually —
 * two bars that mean different things must at least be measured the same way.
 * Values are 0–100 and always shown numerically as well, because a bar alone
 * reads as a judgement and a number reads as a reading.
 */
export function CockpitMeter({ label, value }: { label: string; value?: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value ?? 0)));
  return (
    <div>
      <div className="flex justify-between text-caption text-ink-secondary">
        <span>{label}</span>
        <span className="tabular-nums">{v}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
        <div className="h-full rounded-full bg-ink-primary" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
