"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useLeadActions } from "@/hooks/useLeadActions";
import { formatTimeAgo } from "@/lib/formatting";
import type { LeadNote } from "@/types/lead";

export function LeadNotes({ leadId, notes }: { leadId: string; notes: LeadNote[] }) {
  const { addNote } = useLeadActions(leadId);
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    addNote.mutate(text, { onSuccess: () => setBody("") });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add an internal note…"
          rows={2}
        />
        <div className="flex justify-end">
          <Button size="sm" type="submit" disabled={!body.trim() || addNote.isPending}>
            {addNote.isPending && <Spinner className="text-current" />}
            Add note
          </Button>
        </div>
      </form>

      <ul className="space-y-2">
        {notes.length === 0 ? (
          <li className="text-caption text-ink-secondary">No notes yet.</li>
        ) : (
          notes.map((n) => (
            <li key={n.id} className="rounded-md bg-soft p-3">
              <div className="text-sec text-ink-primary">{n.body}</div>
              <div className="mt-1 text-caption text-ink-secondary">
                {n.author} · {formatTimeAgo(n.createdAt)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
