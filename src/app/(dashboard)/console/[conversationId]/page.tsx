"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { LiveThread } from "@/components/console/LiveThread";
import { ROUTES } from "@/constants/routes";

export default function ConsoleThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);

  return (
    <>
      <Link
        href={ROUTES.console}
        className="mb-4 inline-flex items-center gap-1 text-sec text-ink-primary hover:underline"
      >
        <ArrowLeftIcon className="size-4" /> Back to console
      </Link>
      <LiveThread conversationId={conversationId} />
    </>
  );
}
