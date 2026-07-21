import type { BottleneckPattern } from "@/types/analytics";

export function CommonBottlenecksList({ data }: { data: BottleneckPattern[] }) {
  const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;
  return (
    <ul className="space-y-2.5">
      {data.map((b) => (
        <li key={b.phrase}>
          <div className="flex items-center justify-between gap-3 text-sec">
            <span className="text-ink-secondary">{b.phrase}</span>
            <span className="shrink-0 tabular-nums text-ink-secondary">{b.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
            <div
              className="h-full rounded-full bg-chart-2"
              style={{ width: `${(b.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
