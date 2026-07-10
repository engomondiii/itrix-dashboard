import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FollowUpQueue } from "@/components/follow-up/FollowUpQueue";
import { ROUTES } from "@/constants/routes";

export default function OverdueFollowUpPage() {
  return (
    <>
      <Link
        href={ROUTES.followUp}
        className="mb-4 inline-flex items-center gap-1 text-sec text-sapphire-600 hover:underline"
      >
        <ArrowLeftIcon className="size-4" /> All follow-ups
      </Link>
      <PageHeader
        title="Overdue follow-ups"
        description="Past their response SLA — action needed."
      />
      <FollowUpQueue filter="overdue" />
    </>
  );
}
