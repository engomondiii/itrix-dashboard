"use client";

import { ApprovalsIndicator } from "@/components/layout/ApprovalsIndicator";
import { BreadCrumb } from "@/components/layout/BreadCrumb";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  AttachmentIndicator,
  SupportIndicator,
} from "@/components/layout/QueueIndicators";
import { UserMenu } from "@/components/layout/UserMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SessionUser } from "@/types/auth";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border-soft bg-surface px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <BreadCrumb />
      <div className="ml-auto flex items-center gap-2">
        <CommandMenu />
        <ApprovalsIndicator />
        <SupportIndicator />
        <AttachmentIndicator />
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
