"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { GuardHitTrendPoint } from "@/types/streaming";

/**
 * Guard halts per day, split by which matcher pass caught them (Surface 2
 * v6.0 Phase 3).
 *
 * WHY THE SPLIT IS THE CHART. The total halt count answers "is the guard
 * busy"; the split answers the sharper question — a rising NORMALISED share
 * means prohibited wording is increasingly arriving wrapped in Markdown
 * syntax, drift the raw count alone would understate.
 *
 * Colors are entity-fixed: raw is always chart-6 (teal), normalised is always
 * chart-5 (amber) — the pair is validated CVD-safe against the light surface
 * (see the chart-6 note in globals.css). Identity is never color-alone: the
 * legend and the tooltip both name the passes.
 */

const SERIES = [
  { key: "raw" as const, label: "Raw pass", color: "var(--color-chart-6)" },
  { key: "normalized" as const, label: "Normalised pass", color: "var(--color-chart-5)" },
];

function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function GuardHitTrendChart({ trend }: { trend: GuardHitTrendPoint[] }) {
  const data = trend.map((p) => ({ ...p, label: dayLabel(p.day) }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, left: 0, right: 8 }} barCategoryGap="28%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            width={24}
            tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--color-soft)" }}
            formatter={(value, name) => [
              `${Number(value ?? 0)} halt${Number(value ?? 0) === 1 ? "" : "s"}`,
              SERIES.find((s) => s.key === name)?.label ?? String(name),
            ]}
          />
          {/* Stacked: the bar's height is the day's halts, the split is the
              story. A 2px surface stroke keeps the segments readable where
              they meet; the top segment carries the rounded data-end. */}
          <Bar
            dataKey="raw"
            stackId="halts"
            fill={SERIES[0].color}
            stroke="var(--color-surface)"
            strokeWidth={1}
          />
          <Bar
            dataKey="normalized"
            stackId="halts"
            fill={SERIES[1].color}
            stroke="var(--color-surface)"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Two series → a legend is always present; text wears text tokens and
          the swatch alone carries the color. */}
      <ul className="flex flex-wrap gap-4">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-[3px]"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-caption text-ink-secondary">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
