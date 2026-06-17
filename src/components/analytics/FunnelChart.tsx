"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FunnelStage } from "@/types/analytics";

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const data = stages.map((s) => ({ stage: s.stage, count: s.count }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="stage"
          width={110}
          tick={{ fontSize: 12, fill: "var(--color-ink-500)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "var(--color-sapphire-50)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="var(--color-sapphire-600)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
