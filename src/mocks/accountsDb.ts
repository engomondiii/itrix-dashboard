import "server-only";

import type { AccountListItem, ResendVerificationResult } from "@/types/account";

/**
 * Mock store for the silent self-serve population (Surface 2 v7.1 §04.8).
 *
 * DELIBERATELY NOT IN `MOCK_LEADS`. R70's exclusion of these accounts from
 * every lead queue, tier count and conversion aggregate is structural in mock
 * mode: the leads store never contains them, exactly as the backend's lead
 * queue serializers exclude a self-serve Lead with no turns. The moment a
 * first turn lands they would leave this list and enter the lead stores like
 * any other subject.
 */

const NOW = Date.parse("2026-07-21T11:00:00Z");

const day = 86_400_000;

const ACCOUNTS: AccountListItem[] = [
  {
    clientId: "cli_ss_001",
    leadId: "l_ss_001",
    email: "j.mwangi@keplerfoundry.example",
    fullName: "J. Mwangi",
    organization: "Kepler Foundry",
    accountOrigin: "self_serve",
    emailVerified: true,
    emailVerifiedAt: new Date(NOW - 2 * day + 3_600_000).toISOString(),
    registeredAt: new Date(NOW - 2 * day).toISOString(),
    lastSignInAt: new Date(NOW - 1 * day).toISOString(),
  },
  {
    clientId: "cli_ss_002",
    leadId: "l_ss_002",
    email: "sun.h@parhelion.example",
    fullName: "H. Sun",
    organization: "Parhelion Compute",
    accountOrigin: "self_serve",
    emailVerified: false,
    emailVerifiedAt: null,
    registeredAt: new Date(NOW - 5 * day).toISOString(),
    lastSignInAt: new Date(NOW - 5 * day).toISOString(),
  },
  {
    clientId: "cli_ss_003",
    leadId: "l_ss_003",
    email: "procurement@ostrava-hpc.example",
    fullName: null,
    organization: "Ostrava HPC Centre",
    accountOrigin: "self_serve",
    emailVerified: true,
    emailVerifiedAt: new Date(NOW - 11 * day + 7_200_000).toISOString(),
    registeredAt: new Date(NOW - 11 * day).toISOString(),
    lastSignInAt: null,
  },
  {
    clientId: "cli_ss_004",
    leadId: "l_ss_004",
    email: "amara.o@nyquistlabs.example",
    fullName: "A. Okafor",
    organization: null,
    accountOrigin: "self_serve",
    emailVerified: false,
    emailVerifiedAt: null,
    registeredAt: new Date(NOW - 19 * day).toISOString(),
    lastSignInAt: new Date(NOW - 18 * day).toISOString(),
  },
  {
    clientId: "cli_ss_005",
    leadId: "l_ss_005",
    email: "d.villanueva@tessellate.example",
    fullName: "D. Villanueva",
    organization: "Tessellate Systems",
    accountOrigin: "self_serve",
    emailVerified: true,
    emailVerifiedAt: new Date(NOW - 32 * day + 1_800_000).toISOString(),
    registeredAt: new Date(NOW - 32 * day).toISOString(),
    lastSignInAt: new Date(NOW - 30 * day).toISOString(),
  },
];

/** Resends recorded in-session so repeated calls are visible in the log. */
const resendLog: Array<{ clientId: string; reason: string; by: string; at: string }> = [];

export function listAccounts(): AccountListItem[] {
  // Newest first. The list is visible and countable but deliberately not a
  // queue — no SLA, no urgency ordering, nothing that tells an operator to
  // chase (§04.8).
  return [...ACCOUNTS].sort(
    (a, b) => Date.parse(b.registeredAt) - Date.parse(a.registeredAt),
  );
}

export function accountsCount(): number {
  return ACCOUNTS.length;
}

export type ResendOutcome =
  | { ok: true; result: ResendVerificationResult }
  | { ok: false; status: 404 | 409; detail: string };

/**
 * A resend is an operator action with a REQUIRED reason, logged (§04.9). The
 * reason is required here at the API layer, not only in the dialog — a
 * UI-only requirement disappears the moment somebody calls the endpoint
 * directly, and the value of a reason is that it exists later, when someone
 * asks why an email was sent to an address that had not asked for one.
 */
export function resendVerification(
  clientId: string,
  reason: string,
  by: string,
): ResendOutcome {
  const account = ACCOUNTS.find((a) => a.clientId === clientId);
  if (!account) return { ok: false, status: 404, detail: "Not found" };
  if (!reason.trim()) {
    return { ok: false, status: 409, detail: "A resend requires a reason." };
  }
  if (account.emailVerified) {
    return { ok: false, status: 409, detail: "This address is already verified." };
  }

  const at = new Date().toISOString();
  resendLog.push({ clientId, reason: reason.trim(), by, at });
  return { ok: true, result: { clientId, requestedAt: at } };
}
