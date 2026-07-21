import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Lead not found"
      description="This lead may have been removed or the link is invalid."
      action={
        <Link href={ROUTES.leads} className="text-sec font-medium text-ink-primary">
          Back to all leads
        </Link>
      }
    />
  );
}
