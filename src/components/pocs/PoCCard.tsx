import Link from "next/link";

import { PoCStatusBadge } from "@/components/pocs/PoCStatusBadge";
import { ROUTES } from "@/constants/routes";
import type { PoC } from "@/types/poc";

export function PoCCard({ poc }: { poc: PoC }) {
  const done = poc.milestones.filter((m) => m.status === "done").length;
  const total = poc.milestones.length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <Link
      href={ROUTES.poc(poc.id)}
      className="block rounded-md border border-line bg-surface p-4 shadow-1 transition-colors hover:border-sapphire-300"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sec font-medium text-ink-900">{poc.leadName}</span>
        <PoCStatusBadge status={poc.status} />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-caption text-ink-500">
          <span>Milestones</span>
          <span className="tabular-nums">
            {done}/{total}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
