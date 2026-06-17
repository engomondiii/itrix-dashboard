/**
 * ALPHA product routes and commercial license pathways.
 * Source: Master Architecture Flow §5, PRD §6–7.
 */

export const PRODUCT_ROUTES = ["ALPHA Compute", "ALPHA Core", "Both"] as const;
export type ProductRoute = (typeof PRODUCT_ROUTES)[number];

export const LICENSE_PATHS = ["Non-Exclusive", "Exclusive", "Strategic"] as const;
export type LicensePath = (typeof LICENSE_PATHS)[number];

/** Special / reserved rights a visitor may request (CRM field). */
export const SPECIAL_RIGHTS = [
  "None",
  "Field",
  "Territory",
  "Product-Category",
  "Acquisition",
] as const;
export type SpecialRights = (typeof SPECIAL_RIGHTS)[number];

/** Short-form route labels for compact badges. */
export const PRODUCT_ROUTE_SHORT: Record<ProductRoute, string> = {
  "ALPHA Compute": "Compute",
  "ALPHA Core": "Core",
  Both: "Both",
};

/** Paid evaluation packages (CRM / evaluations). */
export const EVALUATION_PACKAGES = [
  "ALPHA Compute Bottleneck Assessment",
  "ALPHA Core Runtime Fit Assessment",
  "Combined ALPHA Evaluation",
] as const;
export type EvaluationPackage = (typeof EVALUATION_PACKAGES)[number];
