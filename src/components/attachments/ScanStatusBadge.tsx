import { Badge } from "@/components/ui/badge";
import {
  SCAN_VERDICT_INTENT,
  SCAN_VERDICT_LABEL,
  type ScanVerdict,
} from "@/types/attachment";

/**
 * The antivirus / archive-bomb verdict.
 *
 * Scan strictly precedes extraction — an extraction that ran on an unscanned
 * blob is a defect with a named backend test — so this badge is also a claim
 * about ORDER: a file showing extraction results has necessarily been scanned.
 */
export function ScanStatusBadge({ verdict }: { verdict: ScanVerdict }) {
  return <Badge variant={SCAN_VERDICT_INTENT[verdict]}>{SCAN_VERDICT_LABEL[verdict]}</Badge>;
}
