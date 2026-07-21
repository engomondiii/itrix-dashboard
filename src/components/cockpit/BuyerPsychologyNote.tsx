/**
 * What this buyer optimises for.
 *
 * A note about how to PREPARE THE ROOM, not a profile of the person. It is
 * phrased as guidance for us rather than as a claim about them, and it never
 * leaves the team plane — an inference restated to a visitor is exactly the
 * failure mode the personalization rule exists to prevent ("the most tailored
 * pitch and the safest pitch must be the same pitch").
 */
export function BuyerPsychologyNote({ note }: { note?: string }) {
  if (!note) return null;
  return (
    <p className="border-l-2 border-border-soft pl-2 text-caption text-ink-secondary italic">
      {note}
    </p>
  );
}
