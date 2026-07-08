import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** No standalone Governance hub — send the parent path to the claim-cards table. */
export default function GovernanceIndexPage() {
  redirect(ROUTES.governanceClaimCards);
}
