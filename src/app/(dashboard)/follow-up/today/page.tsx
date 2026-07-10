import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { FollowUpQueue } from "@/components/follow-up/FollowUpQueue";
import { ROUTES } from "@/constants/routes";

export default function TodayFollowUpPage() {
  return (
    <>
      <Link
        href={ROUTES.followUp}
        className="mb-4 inline-flex items-center gap-1 text-sec text-sapphire-600 hover:underline"
      >
        <ArrowLeftIcon className="size-4" /> All follow-ups
      </Link>
      <PageHeader title="Due today" description="Follow-ups with an SLA deadline today." />
      <FollowUpQueue filter="today" />
    </>
  );
}
