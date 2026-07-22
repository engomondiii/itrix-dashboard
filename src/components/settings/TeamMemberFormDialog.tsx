"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, type Role } from "@/constants/roles";
import { useTeamActions } from "@/hooks/useTeam";
import type { TeamMember } from "@/types/team";

/**
 * Invite (no `member`) or edit (with `member`) a team member. Mount only when
 * open so field state initialises fresh each time; `onClose` unmounts it.
 */
export function TeamMemberFormDialog({
  member,
  onClose,
}: {
  member?: TeamMember;
  onClose: () => void;
}) {
  const { invite, update } = useTeamActions();
  const editing = !!member;

  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [role, setRole] = useState<Role>(member?.role ?? "Success Team");

  const pending = invite.isPending || update.isPending;
  const valid = name.trim().length > 0 && email.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    if (editing && member) {
      // Email is deliberately NOT sent on edit. The backend serializer lists it
      // in `read_only_fields`, and DRF discards read-only fields on write
      // *silently* — so an admin would edit an address, get a success toast, and
      // find it unchanged. The mock layer does apply it, which would have made
      // this work locally and fail only after cutover. The field is disabled
      // when editing; changing an address is an identity change.
      update.mutate(
        { id: member.id, patch: { name: name.trim(), role } },
        { onSuccess: onClose },
      );
    } else {
      invite.mutate({ name: name.trim(), email: email.trim(), role }, { onSuccess: onClose });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit team member" : "Invite team member"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@itrix.example"
              disabled={editing}
              aria-describedby={editing ? "member-email-hint" : undefined}
            />
            {editing && (
              <p id="member-email-hint" className="text-caption text-ink-secondary">
                The sign-in address cannot be changed here.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="member-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(String(v) as Role)}>
              <SelectTrigger id="member-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
