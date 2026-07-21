"use client";

import { useState } from "react";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryState } from "@/components/ui/query-state";
import { ROLE_DEFS } from "@/constants/roles";
import { useProfile, useUpdateProfile } from "@/hooks/useSettings";

export function ProfileForm() {
  const { data: user, isLoading, isError } = useProfile();
  const update = useUpdateProfile();
  // null until the operator edits; falls back to the server value otherwise.
  const [draft, setDraft] = useState<string | null>(null);

  if (!user) {
    return (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        hasData={false}
        label="your profile"
      />
    );
  }

  const name = draft ?? user.name;
  const dirty = name.trim().length > 0 && name.trim() !== user.name;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    update.mutate(
      { name: name.trim() },
      { onSuccess: () => setDraft(null) },
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={user.email} readOnly disabled />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border-soft bg-surface px-3 py-2">
        <span className="text-sec text-ink-secondary">Role</span>
        <RoleBadge role={user.role} />
      </div>
      <p className="text-caption text-ink-secondary">{ROLE_DEFS[user.role].handles}</p>
      <Button type="submit" disabled={!dirty || update.isPending}>
        {update.isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
