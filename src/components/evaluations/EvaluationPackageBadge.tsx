import { Badge } from "@/components/ui/badge";
import type { EvaluationPackage } from "@/constants/products";

const SHORT: Record<EvaluationPackage, string> = {
  "ALPHA Compute Bottleneck Assessment": "Compute Assessment",
  "ALPHA Core Runtime Fit Assessment": "Core Runtime Fit",
  "Combined ALPHA Evaluation": "Combined",
};

export function EvaluationPackageBadge({ pkg }: { pkg: EvaluationPackage }) {
  return <Badge variant="outline">{SHORT[pkg]}</Badge>;
}
