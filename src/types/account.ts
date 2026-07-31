/**
 * Self-serve accounts with no conversation behind them (Surface 2 v7.1 §04.8).
 *
 * AN ACCOUNT IS NOT A LEAD. R70: a self-serve account with no turns is
 * excluded from every lead queue, tier count, conversion rate, follow-up
 * motion and SLA clock — it has no tier because Layer 1 scores conversations
 * and there is no conversation. It appears in exactly one place, the accounts
 * list, until its first turn lands; then `on_first_turn()` takes the Lead from
 * ARRIVED to IN_REVIEW and every queue that excluded it includes it. The
 * exclusion is about silence, not about origin.
 */
export interface AccountListItem {
  clientId: string;
  /** The Lead minted at ARRIVED alongside the Client (`Client.lead` is non-null). */
  leadId: string;
  email: string;
  fullName: string | null;
  organization: string | null;
  /** How the account was opened — this list is self-serve by construction,
   * but the wire says so rather than the dashboard assuming it. */
  accountOrigin: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null; // ISO
  registeredAt: string; // ISO
  lastSignInAt: string | null; // ISO
}

/** Outcome of an operator-triggered verification resend. */
export interface ResendVerificationResult {
  clientId: string;
  /** When the resend was accepted (the token itself is never in any payload). */
  requestedAt: string; // ISO
}
