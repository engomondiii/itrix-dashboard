"use client";

import { BreadCrumb } from "@/components/layout/BreadCrumb";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchInput } from "@/components/ui/search-input";
import type { SessionUser } from "@/types/auth";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-4">
      <BreadCrumb />
      <div className="ml-auto flex items-center gap-2">
        <SearchInput
          placeholder="Search leads…"
          wrapperClassName="hidden w-56 sm:block"
          aria-label="Search"
        />
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
