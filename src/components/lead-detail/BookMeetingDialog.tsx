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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadActions } from "@/hooks/useLeadActions";
import type { Lead } from "@/types/lead";

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
];

/** Capture the real details of a meeting before moving the lead to "Meeting Booked". */
export function BookMeetingDialog({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const { bookMeeting } = useLeadActions(lead.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [attendee, setAttendee] = useState(lead.visitorName ?? lead.email);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const valid = date && time && attendee.trim().length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || bookMeeting.isPending) return;
    bookMeeting.mutate(
      {
        scheduledAt: `${date}T${time}`,
        durationMins: Number(duration),
        attendee: attendee.trim(),
        location: location.trim(),
        notes: notes.trim() || undefined,
      },
      { onSuccess: onClose },
    );
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
            <DialogTitle>Book a meeting</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-date">Date</Label>
              <Input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-time">Time</Label>
              <Input
                id="meeting-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-duration">Duration</Label>
            <Select value={duration} onValueChange={(v) => setDuration(String(v))}>
              <SelectTrigger id="meeting-duration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-attendee">Attendee (contact)</Label>
            <Input
              id="meeting-attendee"
              value={attendee}
              onChange={(e) => setAttendee(e.target.value)}
              placeholder="Who from the lead's side is joining?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-location">Location / link</Label>
            <Input
              id="meeting-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Video link or room"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting-notes">Agenda / notes</Label>
            <Textarea
              id="meeting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What will you cover?"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!valid || bookMeeting.isPending}>
              {bookMeeting.isPending ? "Booking…" : "Book meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
