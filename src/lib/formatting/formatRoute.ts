import { PRODUCT_ROUTE_SHORT, type ProductRoute } from "@/constants/products";

/** Full route name, e.g. "ALPHA Compute". */
export function formatRoute(route: ProductRoute): string {
  return route;
}

/** Compact route label for badges, e.g. "Compute". */
export function formatRouteShort(route: ProductRoute): string {
  return PRODUCT_ROUTE_SHORT[route];
}
