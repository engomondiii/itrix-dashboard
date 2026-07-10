import type { PitchEngagement } from "@/types/cockpit";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-surface-sunken px-2.5 py-2">
      <div className="text-micro text-ink-400">{label}</div>
      <div className="text-sec font-semibold tabular-nums text-ink-800">{value}</div>
    </div>
  );
}

/** Pitch-room engagement (internal telemetry — never shown to the visitor). */
export function PitchEngagementCard({ pitch }: { pitch: Partial<PitchEngagement> }) {
  if (!pitch || Object.keys(pitch).length === 0) {
    return <p className="text-sec text-ink-400">No pitch engagement yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Stat label="Opened" value={pitch.opened ? "Yes" : "No"} />
      <Stat label="Slides" value={pitch.slidesViewed ?? 0} />
      <Stat label="Dwell (s)" value={pitch.totalDwellSeconds ?? 0} />
      <Stat label="CTA clicks" value={pitch.ctaClicks ?? 0} />
      <Stat label="Questions" value={pitch.questionsAsked ?? 0} />
      <Stat label="Engagement" value={pitch.engagementScore ?? 0} />
    </div>
  );
}
