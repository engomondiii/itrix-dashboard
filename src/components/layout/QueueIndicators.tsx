"use client";

import Link from "next/link";
import { LifeBuoyIcon, PaperclipIcon, type LucideIcon } from "lucide-react";

import { useAttachmentQueue } from "@/hooks/useAttachments";
import { useSupportQueue } from "@/hooks/useSupport";
import { ROUTES } from "@/constants/routes";
import { features } from "@/config/features.config";

/**
 * Topbar chips for the two v5.0 queues that can hold a person up.
 *
 * Same shape and behaviour as `ApprovalsIndicator` — hidden at zero, so the
 * topbar stays quiet when there is nothing to do. A chip that is always present
 * stops being read.
 *
 * The urgency colour is deliberate rather than decorative: a breaching support
 * SLA and a quarantined file are both "someone or something is waiting on a
 * decision", and they share the visual weight of a pending approval.
 */
function Chip({
  href,
  icon: Icon,
  count,
  label,
  urgent,
}: {
  href: string;
  icon: LucideIcon;
  count: number;
  label: string;
  urgent: boolean;
}) {
  if (count === 0) return null;

  return (
    <Link
      href={href}
      aria-label={`${count} ${label}`}
      className={
        urgent
          ? "inline-flex h-7 items-center gap-1.5 rounded-md bg-error-soft px-2 text-caption font-medium text-error-text transition-opacity hover:opacity-80"
          : "inline-flex h-7 items-center gap-1.5 rounded-md bg-soft px-2 text-caption font-medium text-ink-secondary transition-opacity hover:opacity-80"
      }
    >
      <Icon className="size-3.5" />
      <span className="tabular-nums">{count}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function SupportIndicator() {
  const { data } = useSupportQueue();
  if (!features.customerSuccess) return null;

  const summary = data?.summary;
  if (!summary) return null;

  return (
    <Chip
      href={ROUTES.support}
      icon={LifeBuoyIcon}
      count={summary.open}
      label={summary.breaching > 0 ? "support · breaching" : "support"}
      urgent={summary.breaching > 0 || summary.blocking > 0}
    />
  );
}

export function AttachmentIndicator() {
  const { data } = useAttachmentQueue({ quarantinedOnly: true });
  if (!features.attachmentReview) return null;

  const count = data?.length ?? 0;

  return (
    <Chip
      href={ROUTES.attachments}
      icon={PaperclipIcon}
      count={count}
      label="quarantined"
      urgent
    />
  );
}
