"use client";

import { useRouter } from "next/navigation";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ROUTES } from "@/constants/routes";
import { TIERS } from "@/constants/tiers";
import type { Tier } from "@/constants/tiers";

const COLORS = [
  "var(--color-tier-1)",
  "var(--color-tier-2)",
  "var(--color-tier-3)",
  "var(--color-tier-4)",
];

export function TierDistributionChart({ dist }: { dist: Record<Tier, number> }) {
  const router = useRouter();
  const data = TIERS.map((t) => ({ name: `Tier ${t}`, value: dist[t] ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={48}
          outerRadius={74}
          paddingAngle={2}
          className="cursor-pointer outline-none"
          onClick={(_, i) => router.push(ROUTES.leadsTier(TIERS[i]))}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} stroke="var(--color-surface)" />
          ))}
        </Pie>
        <Tooltip />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
