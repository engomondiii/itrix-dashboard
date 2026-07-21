"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PRODUCT_ROUTES } from "@/constants/products";
import type { ProductRoute } from "@/constants/products";

export function ProductRouteDistribution({
  dist,
}: {
  dist: Record<ProductRoute, number>;
}) {
  const data = PRODUCT_ROUTES.map((r) => ({ route: r, count: dist[r] ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="route" tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "var(--color-soft)" }} />
        <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
