import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim()[0])
    .filter(Boolean);
  return parts.slice(0, 2).join("").toUpperCase() || "?";
}

export function LeadOwnerAvatar({ owner }: { owner: string | null }) {
  if (!owner || !owner.trim()) {
    return <span className="text-caption text-ink-400">Unassigned</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <Avatar className="size-6">
        <AvatarFallback className="bg-sapphire-100 text-[10px] font-semibold text-sapphire-700">
          {initials(owner)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sec text-ink-700">{owner}</span>
    </span>
  );
}
