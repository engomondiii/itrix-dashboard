"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { IndustryBreakdown } from "@/types/analytics";

export function IndustryBreakdownChart({ data }: { data: IndustryBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="industry"
          width={180}
          tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "var(--color-soft)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--color-chart-4)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
