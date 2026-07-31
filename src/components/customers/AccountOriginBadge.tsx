import { Badge } from "@/components/ui/badge";
import { ACCOUNT_ORIGIN_LABEL, isAccountOrigin } from "@/types/customer";

/**
 * How this account was opened (Surface 2 v7.1 §04.7).
 *
 * Deliberately distinct from the Lead's source: a self-serve account that
 * later receives a proper invitation for a second engagement keeps
 * `self_serve`, because the account was not earned and the record should not
 * be rewritten to say it was. An operator reading a row needs to know both
 * how we met and how they got in. Unknown values render raw, never nothing.
 */
export function AccountOriginBadge({ origin }: { origin: string | undefined }) {
  if (!origin) return null;

  if (!isAccountOrigin(origin)) {
    return (
      <Badge variant="error" title="Unrecognised account origin — vocabulary drift">
        {origin}
      </Badge>
    );
  }

  return (
    <Badge
      variant={origin === "invited" ? "neutral" : "info"}
      title="How this account was opened"
    >
      {ACCOUNT_ORIGIN_LABEL[origin]}
    </Badge>
  );
}
