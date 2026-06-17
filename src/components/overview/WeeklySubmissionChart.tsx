"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeeklySubmissionChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="subFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-sapphire-600)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-sapphire-600)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-line-subtle)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-sapphire-600)"
          strokeWidth={2}
          fill="url(#subFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
