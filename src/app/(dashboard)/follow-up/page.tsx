import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { FollowUpQueue } from "@/components/follow-up/FollowUpQueue";
import { ROUTES } from "@/constants/routes";

export default function FollowUpPage() {
  return (
    <>
      <PageHeader
        title="Follow-up"
        description="Tier 1 (24h) and Tier 2 (48h) response SLAs."
        actions={
          <div className="flex items-center gap-3 text-sec">
            <Link href={ROUTES.followUpToday} className="text-ink-500 hover:text-ink-700">
              Today
            </Link>
            <Link href={ROUTES.followUpOverdue} className="font-medium text-error-text">
              Overdue
            </Link>
          </div>
        }
      />
      <FollowUpQueue />
    </>
  );
}
