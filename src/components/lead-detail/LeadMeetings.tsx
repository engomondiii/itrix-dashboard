import { CalendarClockIcon, MapPinIcon, UserIcon } from "lucide-react";

import type { LeadMeeting } from "@/types/lead";

function formatWhen(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  if (Number.isNaN(d.getTime())) return scheduledAt.replace("T", " ");
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LeadMeetings({ meetings }: { meetings: LeadMeeting[] }) {
  if (meetings.length === 0) {
    return <p className="text-caption text-ink-400">No meetings booked yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {meetings.map((m) => (
        <li key={m.id} className="rounded-md border border-line bg-surface-sunken p-3">
          <div className="flex items-center gap-2 text-sec font-medium text-ink-900">
            <CalendarClockIcon className="size-4 text-sapphire-600" />
            {formatWhen(m.scheduledAt)}
            <span className="text-caption font-normal text-ink-400">
              · {m.durationMins} min
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-caption text-ink-600">
            <UserIcon className="size-3.5" />
            {m.attendee}
          </div>
          {m.location && (
            <div className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-600">
              <MapPinIcon className="size-3.5" />
              {m.location}
            </div>
          )}
          {m.notes && (
            <p className="mt-1.5 text-caption text-ink-500">{m.notes}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
