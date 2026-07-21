import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import type { NDAChecklistItem } from "@/types/nda";

export function NDAChecklistDisplay({ items }: { items: NDAChecklistItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2 text-sec">
          {item.done ? (
            <CheckCircle2Icon className="size-4 shrink-0 text-success" />
          ) : (
            <CircleIcon className="size-4 shrink-0 text-ink-muted" />
          )}
          <span className={item.done ? "text-ink-secondary" : "text-ink-secondary"}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
