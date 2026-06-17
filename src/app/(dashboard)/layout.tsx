import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ROUTES } from "@/constants/routes";
import { getSessionUser } from "@/lib/server/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
