import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function RootPage() {
  // The (dashboard) layout guard bounces to /login if there's no session.
  redirect(ROUTES.overview);
}
