import { Badge } from "@/components/ui/badge";
import type { SpecialRights } from "@/constants/products";

export function LeadSpecialRightsBadge({ rights }: { rights: SpecialRights }) {
  if (rights === "None") return null;
  return <Badge variant="signature">{rights} rights</Badge>;
}
