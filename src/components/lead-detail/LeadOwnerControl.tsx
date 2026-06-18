"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadActions } from "@/hooks/useLeadActions";
import { MOCK_TEAM } from "@/mocks/users";

const UNASSIGNED = "__none__";

export function LeadOwnerControl({
  leadId,
  owner,
}: {
  leadId: string;
  owner: string | null;
}) {
  const { assign } = useLeadActions(leadId);
  // The chosen owner waits in `pending` until the handoff note is confirmed,
  // so the Select visually reverts if the dialog is cancelled.
  const [pending, setPending] = useState<string | null | undefined>(undefined);
  const [note, setNote] = useState("");

  function onSelect(v: string | null) {
    const next = v === UNASSIGNED ? null : v;
    if (next === owner) return;
    setNote("");
    setPending(next);
  }

  const open = pending !== undefined;

  return (
    <>
      <Select value={owner ?? UNASSIGNED} onValueChange={onSelect}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue>{(v) => (v === UNASSIGNED ? "Unassigned" : String(v))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
          {MOCK_TEAM.map((m) => (
            <SelectItem key={m.id} value={m.name}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) setPending(undefined);
        }}
      >
        <DialogContent showCloseButton={false}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (assign.isPending) return;
              assign.mutate(
                { owner: pending ?? null, note: note.trim() || undefined },
                { onSuccess: () => setPending(undefined) },
              );
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>
                {pending ? `Assign to ${pending}` : "Unassign lead"}
              </DialogTitle>
              <DialogDescription>
                Add an optional handoff note — context for whoever picks this up.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="assign-note">Handoff note (optional)</Label>
              <Textarea
                id="assign-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Took the intro call; they want a Tier-1 follow-up on pricing"
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={assign.isPending}>
                {assign.isPending ? "Saving…" : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
