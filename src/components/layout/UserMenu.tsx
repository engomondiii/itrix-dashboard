"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { ROLE_DEFS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import type { SessionUser } from "@/types/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: SessionUser }) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="bg-tint text-caption font-semibold text-ink-primary">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium text-ink-primary">{user.name}</div>
          <div className="text-caption font-normal text-ink-secondary">{user.email}</div>
          <div className="mt-1 text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
            {ROLE_DEFS[user.role].role}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(ROUTES.settingsProfile)}>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-error-text focus:bg-error-soft focus:text-error-text"
          onClick={() => logout.mutate()}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
