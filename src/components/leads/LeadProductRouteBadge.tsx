import { Badge } from "@/components/ui/badge";
import { formatRouteShort } from "@/lib/formatting";
import type { ProductRoute } from "@/constants/products";

export function LeadProductRouteBadge({ route }: { route: ProductRoute }) {
  return <Badge variant="outline">{formatRouteShort(route)}</Badge>;
}
