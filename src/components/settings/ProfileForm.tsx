"use client";

import { useState } from "react";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ROLE_DEFS } from "@/constants/roles";
import { useProfile, useUpdateProfile } from "@/hooks/useSettings";

export function ProfileForm() {
  const { data: user, isLoading } = useProfile();
  const update = useUpdateProfile();
  // null until the operator edits; falls back to the server value otherwise.
  const [draft, setDraft] = useState<string | null>(null);

  if (isLoading || !user) {
    return <Spinner />;
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
      <div className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2">
        <span className="text-sec text-ink-500">Role</span>
        <RoleBadge role={user.role} />
      </div>
      <p className="text-caption text-ink-400">{ROLE_DEFS[user.role].handles}</p>
      <Button type="submit" disabled={!dirty || update.isPending}>
        {update.isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
