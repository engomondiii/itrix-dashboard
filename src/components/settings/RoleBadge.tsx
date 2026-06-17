import { Badge } from "@/components/ui/badge";
import type { Role } from "@/constants/roles";

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={role === "Admin" ? "info" : "neutral"}>{role}</Badge>;
}
