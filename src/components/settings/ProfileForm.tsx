"use client";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { Spinner } from "@/components/ui/spinner";
import { ROLE_DEFS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";

export function ProfileForm() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) {
    return <Spinner />;
  }
  return (
    <dl className="space-y-3">
      <div className="flex items-center justify-between">
        <dt className="text-sec text-ink-500">Name</dt>
        <dd className="text-sec font-medium text-ink-900">{user.name}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-sec text-ink-500">Email</dt>
        <dd className="text-sec text-ink-800">{user.email}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-sec text-ink-500">Role</dt>
        <dd>
          <RoleBadge role={user.role} />
        </dd>
      </div>
      <p className="text-caption text-ink-400">{ROLE_DEFS[user.role].handles}</p>
    </dl>
  );
}
