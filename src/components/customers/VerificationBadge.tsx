import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";

/**
 * Whether anything can be emailed to this address yet (Surface 2 v7.1 §04.7).
 *
 * On the row and not buried in a detail panel because it changes what an
 * operator may promise: "I'll email that over" to an unverified address is a
 * promise the platform will not keep — the backend sends no non-transactional
 * mail to an unverified address, by design (Backend v7.2 §15.10).
 *
 * The operator sees THAT a verification is outstanding. They never see the
 * token — a verification token visible to an operator is an account-takeover
 * primitive with an audit trail attached (§08).
 */
export function VerificationBadge({
  verified,
  verifiedAt,
}: {
  verified: boolean | undefined;
  verifiedAt?: string | null;
}) {
  if (verified === undefined) return null;

  return verified ? (
    <Badge
      variant="success"
      title={verifiedAt ? `Address verified ${formatDate(verifiedAt)}` : "Address verified"}
    >
      Verified
    </Badge>
  ) : (
    <Badge
      variant="warning"
      title="Unverified address — no non-transactional email will be sent to it"
    >
      Unverified
    </Badge>
  );
}
