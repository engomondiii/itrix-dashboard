import { formatTimeAgo } from "@/lib/formatting";
import type { LeadActivity } from "@/types/lead";

export function LeadTimeline({ activity }: { activity: LeadActivity[] }) {
  if (activity.length === 0) {
    return <p className="text-caption text-ink-400">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-line pl-4">
      {activity.map((a) => (
        <li key={a.id} className="relative">
          <span className="absolute top-1 -left-[21px] size-2 rounded-full bg-sapphire-500 ring-2 ring-surface" />
          <div className="text-sec text-ink-800">{a.label}</div>
          <div className="text-caption text-ink-400">
            {formatTimeAgo(a.at)}
            {a.by ? ` · ${a.by}` : ""}
          </div>
        </li>
      ))}
    </ol>
  );
}
