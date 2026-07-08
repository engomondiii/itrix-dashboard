import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** No standalone Agents hub — send the parent path to the approvals queue. */
export default function AgentsIndexPage() {
  redirect(ROUTES.agentApprovals);
}
